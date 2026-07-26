import fs from "node:fs/promises";
import crypto from "node:crypto";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { YoutubeTranscript } from "youtube-transcript";
import * as cheerio from "cheerio";
import officeParser from "officeparser";
import { PrismaClient } from "@prisma/client";

import { config } from "./config.js";
import { qdrant, ensureCollection } from "./rag/qdrant.js";
import { embedTexts } from "./rag/openai.js";

// Initialize Prisma directly for the background Node worker
const prisma = new PrismaClient();

export function chunkText(text, chunkSize = config.chunking.chunkSize, overlap = config.chunking.chunkOverlap) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const chunks = [];
  let start = 0;

  while (start < clean.length) {
    let end = Math.min(start + chunkSize, clean.length);
    if (end < clean.length) {
      const lastSpace = clean.lastIndexOf(" ", end);
      if (lastSpace > start) end = lastSpace;
    }

    const chunk = clean.slice(start, end).trim();
    if (chunk) chunks.push(chunk);

    if (end >= clean.length) break;
    start = end - overlap;
    if (start < 0) start = 0;
  }

  return chunks;
}

/**
 * Universal Source Indexer
 * Routes the file/URL to the correct parser based on MIME type.
 */
export async function processSourceIndexing(jobData) {
  const { filePath, mimeType, sourceId, youtubeUrl, videoId, websiteUrl, originalName } = jobData;
  let rawText = "";

  try {
    console.log(`🔍 Extracting text for type: ${mimeType}`);

    // 1. YouTube Video (Transcript)
    if (mimeType === "video/youtube" && videoId) {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      // Format text with timestamps so the LLM can reference them easily!
      rawText = transcript.map(t => {
        const seconds = Math.floor(t.offset / 1000);
        return `[Time: ${seconds}] ${t.text}`;
      }).join("\n");
    } 
    
    // 2. Website Crawling
    else if (mimeType === "text/html" && websiteUrl) {
      const res = await fetch(websiteUrl);
      const html = await res.text();
      const $ = cheerio.load(html);
      // Remove scripts, styles, and navs
      $('script, style, noscript, nav, footer').remove();
      rawText = $('body').text().replace(/\s+/g, ' ').trim();
    } 
    
    // 3. PDF Parsing
    else if (mimeType === "application/pdf") {
      const buffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text;
    } 
    
    // 4. Powerpoint / Word Docs
    else if (mimeType === "ppt" || mimeType === "application/vnd.ms-powerpoint" || mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
      rawText = await officeParser.parseOfficeAsync(filePath);
    } 
    
    // 5. Standard Text / Markdown / VTT Fallback
    else if (filePath) {
      rawText = await fs.readFile(filePath, "utf-8");
    }

    // -- Indexing Process --
    if (!rawText || rawText.trim().length === 0) {
      throw new Error("No readable text found in this source.");
    }

    const collection = await ensureCollection();
    const chunks = chunkText(rawText);
    const vectors = await embedTexts(chunks);

    const points = chunks.map((chunk, i) => {
      // Attempt to extract timestamp from the chunk if it's a YouTube video
      const timeMatch = chunk.match(/\[Time:\s*(\d+)\]/);
      const timestamp = timeMatch ? parseInt(timeMatch[1]) : null;

      return {
        id: crypto.randomUUID(),
        vector: vectors[i],
        payload: {
          text: chunk,
          source: originalName,
          filePath: filePath || null,
          chunkIndex: i,
          type: mimeType,
          timestamp: timestamp 
        },
      };
    });

    // Upload to Qdrant
    await qdrant.upsert(collection, { wait: true, points });

    // Update the database to mark it as COMPLETED (Turns UI Spinner Green)
    if (sourceId) {
      await prisma.source.update({
        where: { id: sourceId },
        data: { status: "COMPLETED" }
      });
    }

    return { chunks: chunks.length };

  } catch (error) {
    console.error(`❌ Indexing failed for ${originalName}:`, error);
    
    // Update database to mark it as FAILED (Turns UI Spinner Red)
    if (sourceId) {
      await prisma.source.update({
        where: { id: sourceId },
        data: { status: "FAILED" }
      });
    }
    throw error;
  }
}