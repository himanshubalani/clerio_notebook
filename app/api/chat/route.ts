import { loadChatMessages, saveChatMessages } from "@/features/ai/actions/chat-store";
import { getChatModel } from "@/features/ai/utils/model";
import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import { retrieveChunks } from "@/lib/retriever";
import { auth } from "@clerk/nextjs/server";
import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

export async function POST(req: Request) {
  await auth.protect();

  const { message, id }: { message: UIMessage; id: string } = await req.json();

  if (!message || !id) {
    return new Response("Missing message or conversation id", { status: 400 });
  }

  const user = await requireUser();

  // Ensure conversation exists
  let conversation = await prisma.conversation.findFirst({
    where: { id, userId: user.id },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { id, userId: user.id, title: "New Notebook" },
    });
  }

  const previousMessages = await loadChatMessages(id);
  const alreadySaved = previousMessages.some(
    (stored) => stored.id === message.id
  );
  const messages = alreadySaved
    ? previousMessages
    : [...previousMessages, message];

  if (!alreadySaved) {
    await saveChatMessages(id, [message]);
  }

  // ── RAG: retrieve relevant chunks from Qdrant ─────────────────────────────
  const userText =
    message.role === "user"
      ? message.parts
          .filter((p) => p.type === "text")
          // @ts-expect-error ai sdk parts typing
          .map((p) => p.text as string)
          .join("")
      : "";

  let ragSystemPrompt = conversation.systemPrompt ?? "";

  if (userText.trim()) {
    try {
      const { chunks } = (await retrieveChunks(userText)) as {
        chunks: Array<{
          text: string;
          source: string | null;
          chunkIndex: number | null;
          bestScore: number;
          rrfScore: number;
          matchedBy: string[];
          metadata?: { page?: number; timestamp?: number };
        }>;
      };

      if (chunks.length > 0) {
        const contextBlock = chunks
          .map(
            (c, i) =>
              `[${i + 1}] Source: ${c.source ?? "unknown"} | Page: ${c.metadata?.page ?? ""} | Time: ${c.metadata?.timestamp ?? ""}\n${c.text}`
          )
          .join("\n\n");

        ragSystemPrompt = `You are Clerio Notebook, an expert research assistant. Answer the user's question using ONLY the context below.

When you state a fact from the context, you MUST append a citation in this EXACT format at the end of the sentence:
[[Source: {sourceName} | Type: {sourceType} | Page: {page} | Time: {timestamp}]]

Examples:
- "Binary trees are hierarchical structures. [[Source: DataStructures.pdf | Type: pdf | Page: 45 | Time: ]]"
- "Dijkstra explained this at the 15-minute mark. [[Source: MIT 6.006 Lecture | Type: youtube | Page: | Time: 900]]"

If the answer is not in the context, say you don't know — do not make up information.
The user's name is ${user.firstName ?? "there"}.

Context:
${contextBlock}`;
      }
    } catch (ragErr) {
      console.error("RAG retrieval failed (falling back to base LLM):", ragErr);
      // Gracefully degrade — still answer without RAG context
      ragSystemPrompt =
        ragSystemPrompt ||
        `You are Clerio Notebook, an expert research assistant. The user is ${user.firstName ?? "there"}.`;
    }
  }

  const maxOutputTokens = Number.parseInt(
    process.env.MAX_TOKENS ?? "",
    10
  );

  const result = streamText({
    model: getChatModel(conversation.model),
    system: ragSystemPrompt,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: Number.isFinite(maxOutputTokens) ? maxOutputTokens : 2048,
    stopWhen: stepCountIs(3),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
      onEnd: async ({ messages: finalMessages }) => {
        try {
          await saveChatMessages(id, finalMessages, { updateTitle: false });
        } catch (error) {
          console.error("Failed to save final messages:", error);
        }
      },
    }),
  });
}
