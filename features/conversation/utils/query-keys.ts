/** TanStack Query key factory for conversations, messages, and sources caches. */
export const queryKeys = {
  conversations: {
    all: ["conversations"] as const,
    detail: (id: string) => ["conversations", id] as const,
  },
  messages: {
    byConversation: (conversationId: string) =>
      ["messages", conversationId] as const,
  },
  sources: {
    byConversation: (conversationId: string) =>
      ["sources", conversationId] as const,
  },
};
