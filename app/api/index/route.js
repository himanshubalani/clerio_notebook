import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { enqueueIndexingJob } from "@/lib/queue";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // Convert Web File to Node Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create uploads dir if it doesn't exist
    const uploadDir = path.join(process.cwd(), "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Save file to disk
    const unique = `${Date.now()}-${crypto.randomUUID()}`;
    const filename = `${unique}.pdf`;
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    // Enqueue BullMQ Job
    const job = await enqueueIndexingJob({
      filePath: filePath,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
    });

    return NextResponse.json({
      message: "File uploaded and queued for indexing",
      jobId: job.id,
      file: { originalName: file.name, storedAs: filename, size: file.size },
    }, { status: 202 });

  } catch (err) {
    console.error("Failed to enqueue indexing job:", err);
    return NextResponse.json({ error: "Failed to queue file" }, { status: 500 });
  }
}