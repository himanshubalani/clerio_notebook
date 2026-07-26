import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import { enqueueIndexingJob } from "@/lib/rag/queue";

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1);
    }
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

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

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
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
        name: `YouTube: ${videoId}`,
        type: "youtube",
        url,
        status: "INDEXING",
      },
    });

    await enqueueIndexingJob({
      filePath: "",
      originalName: `YouTube: ${videoId}`,
      mimeType: "video/youtube",
      size: 0,
      sourceId: source.id,
      conversationId,
      youtubeUrl: url,
      videoId,
    });

    return NextResponse.json(
      { message: "YouTube video queued for indexing", sourceId: source.id },
      { status: 202 }
    );
  } catch (err) {
    console.error("YouTube source error:", err);
    return NextResponse.json({ error: "Failed to add YouTube source" }, { status: 500 });
  }
}
