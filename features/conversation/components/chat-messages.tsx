"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type ChatStatus, type UIMessage } from "ai";
import { GitForkIcon } from "lucide-react";
import { createBranch } from "@/features/conversation/actions/conversation-actions";
import { CopyMessageButton } from "@/components/ui/copy-message";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import { Loader } from "@/components/ai-elements/loader";

/** A citation parsed from the AI response text. */
export type ParsedCitation = {
  sourceName: string;
  type: string;
  page: string;
  timestamp: string;
  rawText: string;
};

type ChatMessagesProps = {
  messages: UIMessage[];
  status: ChatStatus;
  conversationId: string;
  onCitationClick?: (citation: ParsedCitation) => void;
};

const CITATION_REGEX =
  /\[\[Source:\s*(.*?)\s*\|\s*Type:\s*(.*?)\s*\|\s*Page:\s*(.*?)\s*\|\s*Time:\s*(.*?)\]\]/g;

/**
 * Parses AI response text and renders citation markers as clickable pills.
 */
function renderWithCitations(
  text: string,
  onCitationClick?: (c: ParsedCitation) => void
) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(CITATION_REGEX.source, "g");

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex, match.index)}
        </span>
      );
    }

    const citation: ParsedCitation = {
      sourceName: match[1] ?? "",
      type: match[2] ?? "",
      page: match[3] ?? "",
      timestamp: match[4] ?? "",
      rawText: match[0],
    };

    parts.push(
      <button
        key={`cite-${match.index}`}
        type="button"
        onClick={() => onCitationClick?.(citation)}
        className="mx-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
      >
        {citation.sourceName}
        {citation.page && citation.page !== "" && (
          <span className="opacity-70">p.{citation.page}</span>
        )}
        {citation.timestamp && citation.timestamp !== "" && (
          <span className="opacity-70">{citation.timestamp}s</span>
        )}
      </button>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-end`}>{text.substring(lastIndex)}</span>
    );
  }

  return parts.length > 0 ? parts : text;
}

export function ChatMessages({
  messages,
  status,
  conversationId,
  onCitationClick,
}: ChatMessagesProps) {
  const isWaiting =
    status === "submitted" && messages.at(-1)?.role === "user";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleBranch = (messageId: string) => {
    startTransition(async () => {
      try {
        const newId = await createBranch(conversationId, messageId);
        toast.success("Timeline branched!");
        router.push(`/c/${newId}`);
      } catch (err) {
        toast.error(`Failed to create branch - ${err}`);
      }
    });
  };

  return (
    <Conversation>
      <ConversationContent className="py-6">
        {messages.map((message) => {
          const rawText = message.parts
            .filter((p) => p.type === "text")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((p) => (p as any).text as string)
            .join("");

          const hasCitations = CITATION_REGEX.test(rawText);
          // Reset lastIndex after test
          CITATION_REGEX.lastIndex = 0;

          return (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                {message.role === "assistant" && hasCitations ? (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {renderWithCitations(rawText, onCitationClick)}
                  </div>
                ) : (
                  <MessageResponse>{rawText}</MessageResponse>
                )}
              </MessageContent>

              <MessageActions
                className={`opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <CopyMessageButton text={rawText} />
                <MessageAction
                  tooltip="Branch from this message"
                  onClick={() => handleBranch(message.id)}
                  disabled={isPending}
                >
                  <GitForkIcon className="size-4" />
                </MessageAction>
              </MessageActions>
            </Message>
          );
        })}

        {isWaiting && (
          <Message from="assistant">
            <MessageContent>
              <Loader />
            </MessageContent>
          </Message>
        )}
      </ConversationContent>
    </Conversation>
  );
}
