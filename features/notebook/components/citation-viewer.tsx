"use client";

import { XIcon, ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ParsedCitation } from "@/features/conversation/components/chat-messages";

type CitationViewerProps = {
  citation: ParsedCitation;
  onClose: () => void;
  className?: string;
};

/**
 * Formats seconds into a YouTube-style timestamp string (e.g. 75 → "1:15").
 */
function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    return u.searchParams.get("v") ?? u.pathname.split("/").at(-1) ?? null;
  } catch {
    return null;
  }
}

export function CitationViewer({
  citation,
  onClose,
  className,
}: CitationViewerProps) {
  const timestampSecs = citation.timestamp
    ? Number(citation.timestamp)
    : undefined;

  const formattedTime =
    timestampSecs != null && !Number.isNaN(timestampSecs)
      ? formatTimestamp(timestampSecs)
      : citation.timestamp || undefined;

  const renderViewer = () => {
    // PDF viewer — browsers support #page=X for jumping to a page
    if (citation.type === "pdf") {
      const page = citation.page && citation.page !== "" ? citation.page : "1";
      // We serve uploaded files from /uploads/
      const fileName = citation.sourceName;
      return (
        <iframe
          src={`/uploads/${encodeURIComponent(fileName)}#page=${page}`}
          className="w-full h-full border-0"
          title={`${citation.sourceName} page ${page}`}
        />
      );
    }

    // YouTube viewer — ?start=X jumps to timestamp
    if (citation.type === "youtube") {
      const videoId = extractVideoId(citation.sourceName) ?? citation.sourceName;
      const startParam =
        timestampSecs != null && !Number.isNaN(timestampSecs)
          ? `&start=${timestampSecs}`
          : "";
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1${startParam}`}
          className="w-full aspect-video"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={citation.sourceName}
        />
      );
    }

    // Website
    if (citation.type === "website") {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
          <ExternalLinkIcon className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Open the website in a new tab to view the content.
          </p>
          <Button
            variant="outline"
            size="sm"
          >
            <a
              href={citation.sourceName}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in new tab
            </a>
          </Button>
        </div>
      );
    }

    // VTT / plain text
    return (
      <div className="p-4 text-sm whitespace-pre-wrap text-foreground leading-relaxed overflow-y-auto h-full">
        {citation.rawText}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background shrink-0">
        <div className="min-w-0">
          <h3 className="font-medium text-sm truncate">{citation.sourceName}</h3>
          <p className="text-xs text-muted-foreground">
            {citation.type === "pdf" && citation.page
              ? `Page ${citation.page}`
              : formattedTime
              ? `Timestamp: ${formattedTime}`
              : citation.type}
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close citation panel">
          <XIcon size={16} />
        </Button>
      </div>

      {/* Viewer */}
      <div className="flex-1 bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
        {renderViewer()}
      </div>

      {/* Extracted text segment */}
      {citation.rawText && (
        <div className="h-1/3 min-h-[80px] p-4 overflow-y-auto border-t bg-background text-sm">
          <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Extracted Segment
          </p>
          <p className="text-sm leading-relaxed italic text-foreground/80">
            &ldquo;
            {/* Strip the [[Source: ...]] marker from displayed text */}
            {citation.rawText.replace(/\[\[Source:.*?\]\]/g, "").trim()}
            &rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
