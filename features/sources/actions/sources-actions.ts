"use server";

import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type SourceItem = {
  id: string;
  conversationId: string;
  name: string;
  type: string;
  url: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

/** List all sources for a conversation. */
export async function listSources(
  conversationId: string
): Promise<SourceItem[]> {
  const user = await requireUser();

  // Verify ownership
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: user.id },
  });
  if (!conversation) throw new Error("Conversation not found");

  return prisma.source.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      conversationId: true,
      name: true,
      type: true,
      url: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/** Create a source record (status starts as INDEXING). */
export async function createSource(
  conversationId: string,
  data: { name: string; type: string; url?: string }
): Promise<SourceItem> {
  const user = await requireUser();

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: user.id },
  });
  if (!conversation) throw new Error("Conversation not found");

  const source = await prisma.source.create({
    data: {
      conversationId,
      name: data.name,
      type: data.type,
      url: data.url ?? null,
      status: "INDEXING",
    },
    select: {
      id: true,
      conversationId: true,
      name: true,
      type: true,
      url: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  revalidatePath(`/app/c/${conversationId}`);
  return source;
}

/** Update a source's status (e.g. COMPLETED, FAILED). */
export async function updateSourceStatus(
  sourceId: string,
  status: string
): Promise<void> {
  await prisma.source.update({
    where: { id: sourceId },
    data: { status },
  });
}

/** Delete a source. */
export async function deleteSource(sourceId: string): Promise<{ id: string }> {
  const user = await requireUser();

  const existing = await prisma.source.findUnique({
    where: { id: sourceId },
    include: { conversation: true },
  });

  if (!existing || existing.conversation.userId !== user.id) {
    throw new Error("Source not found");
  }

  await prisma.source.delete({ where: { id: sourceId } });
  revalidatePath(`/app/c/${existing.conversationId}`);
  return { id: sourceId };
}
