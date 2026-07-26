import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import { enqueueIndexingJob } from "@/lib/rag/queue";

const ACCEPTED_MIME_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "text/plain": "text",
  "text/vtt": "vtt",
  "text/markdown": "text",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "ppt",
};

export async function POST(req: Request) {
  await auth.protect();
  const user = await requireUser();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const conversationId = formData.get("conversationId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: user.id },
    });
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const sourceType = ACCEPTED_MIME_TYPES[file.type];
    if (!sourceType) {
      // Try extension fallback
      const ext = file.name.split(".").at(-1)?.toLowerCase();
      const extMap: Record<string, string> = {
        pdf: "pdf",
        txt: "text",
        md: "text",
        vtt: "vtt",
        ppt: "ppt",
        pptx: "ppt",
      };
      if (!ext || !extMap[ext]) {
        return NextResponse.json(
          { error: "Unsupported file type" },
          { status: 400 }
        );
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const unique = `${Date.now()}-${crypto.randomUUID()}`;
    const ext = file.name.split(".").at(-1) ?? "bin";
    const filename = `${unique}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    // Create Source record in DB (status: INDEXING)
    const source = await prisma.source.create({
      data: {
        conversationId,
        name: file.name,
        type: sourceType ?? "text",
        url: filePath,
        status: "INDEXING",
      },
    });

    // Enqueue indexing job
    await enqueueIndexingJob({
      filePath,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      sourceId: source.id,
      conversationId,
    });

    return NextResponse.json(
      {
        message: "File uploaded and queued for indexing",
        sourceId: source.id,
        file: { originalName: file.name, storedAs: filename, size: file.size },
      },
      { status: 202 }
    );
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
