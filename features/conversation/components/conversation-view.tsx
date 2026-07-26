"use client";

import React, { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { GitForkIcon, ChevronDownIcon, CheckIcon } from "lucide-react";
import Link from "next/link";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useConversations } from "@/features/conversation/hooks/use-conversation";
import { queryKeys } from "@/features/conversation/utils/query-keys";
import { ChatEmpty } from "@/features/conversation/components/chat-empty";
import { ChatMessages, type ParsedCitation } from "@/features/conversation/components/chat-messages";
import { ChatComposer } from "@/features/conversation/components/chat-composer";
import { SourcesSidebar } from "@/features/notebook/components/sources-sidebar";
import { CitationViewer } from "@/features/notebook/components/citation-viewer";

type ConversationViewProps = {
  conversationId: string;
  initialMessages: UIMessage[];
};

export const ConversationView = ({
  conversationId,
  initialMessages,
}: ConversationViewProps) => {
  const queryClient = useQueryClient();
  const { data: conversations } = useConversations();
  const pathname = usePathname();
  const [activeCitation, setActiveCitation] = useState<ParsedCitation | null>(
    null
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: { id, message: messages.at(-1) },
        }),
      }),
    []
  );

  const { messages, sendMessage, status } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport,
    onFinish: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
    },
    onError: (error) => toast.error(error.message),
  });

  // Seamlessly update URL once messages start without re-mounting
  React.useEffect(() => {
    if (pathname === "/app" && messages.length > 0) {
      window.history.replaceState(null, "", `/app/c/${conversationId}`);
    }
  }, [messages.length, pathname, conversationId]);

  const currentConv = conversations?.find((item) => item.id === conversationId);
  const title = currentConv?.title ?? "New Notebook";

  const rootId = currentConv?.rootId || currentConv?.id;
  const relatedBranches =
    conversations?.filter((c) => (c.rootId || c.id) === rootId) ?? [];

  return (
    <div className="flex h-full min-h-0 w-full">
      {/* ── Left: Sources sidebar ─────────────────────── */}
      <SourcesSidebar
        conversationId={conversationId}
        className="w-64 shrink-0 border-r"
      />

      {/* ── Center: Chat ──────────────────────────────── */}
      <div className="flex flex-1 min-w-0 flex-col h-full">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-1 h-4" />
          <h1 className="truncate text-sm font-medium flex-1">{title}</h1>

          {relatedBranches.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto flex items-center gap-1.5 h-8"
                  />
                }
              >
                <GitForkIcon className="size-3" />
                Branches ({relatedBranches.length})
                <ChevronDownIcon className="size-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {relatedBranches.map((branch) => (
                  <DropdownMenuItem key={branch.id}>
                    <Link
                      href={`/app/c/${branch.id}`}
                      className="flex items-center justify-between w-full"
                    >
                      <span className="truncate">{branch.title}</span>
                      {branch.id === conversationId && (
                        <CheckIcon className="size-4 ml-2" />
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>

        {/* Messages / Empty */}
        {messages.length === 0 ? (
          <ChatEmpty />
        ) : (
          <ChatMessages
            messages={messages}
            status={status}
            conversationId={conversationId}
            onCitationClick={(citation) => setActiveCitation(citation)}
          />
        )}

        {/* Composer */}
        <ChatComposer
          onSend={(text) => {
            void sendMessage({ text });
          }}
          isSending={status !== "ready"}
          autoFocus
        />
      </div>

      {/* ── Right: Citation viewer (conditional) ──────── */}
      {activeCitation && (
        <div className="w-80 xl:w-96 shrink-0 border-l bg-muted/10 flex flex-col">
          <CitationViewer
            citation={activeCitation}
            onClose={() => setActiveCitation(null)}
            className="h-full"
          />
        </div>
      )}
    </div>
  );
};
