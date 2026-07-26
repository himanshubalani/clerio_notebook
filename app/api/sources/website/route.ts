import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import { enqueueIndexingJob } from "@/lib/rag/queue";

export async function POST(req: Request) {
  await auth.protect();
  const user = await requireUser();

  try {
    const { url, conversationId } = (await req.json()) as {
      url: string;
      conversationId: string;
    };

    if (!url || !conversationId) {
      return NextResponse.json(
        { error: "url and conversationId are required" },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: user.id },
    });
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const source = await prisma.source.create({
      data: {
        conversationId,
        name: url,
        type: "website",
        url,
        status: "INDEXING",
      },
    });

    await enqueueIndexingJob({
      filePath: "",
      originalName: url,
      mimeType: "text/html",
      size: 0,
      sourceId: source.id,
      conversationId,
      websiteUrl: url,
    });

    return NextResponse.json(
      { message: "Website queued for indexing", sourceId: source.id },
      { status: 202 }
    );
  } catch (err) {
    console.error("Website source error:", err);
    return NextResponse.json({ error: "Failed to add website" }, { status: 500 });
  }
}
