"use client";

import { useRef, useState } from "react";
import {
  PlusIcon,
  FileTextIcon,
  PlayCircleIcon,
  GlobeIcon,
  FileIcon,
  Loader2Icon,
  CheckCircleIcon,
  XCircleIcon,
  Trash2Icon,
  UploadCloudIcon,
  LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useSources, useDeleteSource } from "@/features/sources/hooks/use-sources";
import type { SourceItem } from "@/features/sources/actions/sources-actions";
import { cn } from "@/lib/utils";

const SOURCE_TYPE_ICONS: Record<string, React.ElementType> = {
  pdf: FileTextIcon,
  youtube: PlayCircleIcon,
  website: GlobeIcon,
  text: FileIcon,
  vtt: FileTextIcon,
  ppt: FileTextIcon,
};

function SourceIcon({ type, className }: { type: string; className?: string }) {
  const Icon = SOURCE_TYPE_ICONS[type] ?? FileIcon;
  return <Icon className={cn("shrink-0", className)} size={14} />;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "INDEXING") {
    return (
      <Loader2Icon
        className="animate-spin text-blue-500 shrink-0"
        size={14}
        aria-label="Indexing"
      />
    );
  }
  if (status === "FAILED") {
    return (
      <XCircleIcon
        className="text-destructive shrink-0"
        size={14}
        aria-label="Failed"
      />
    );
  }
  return (
    <CheckCircleIcon
      className="text-green-500 shrink-0"
      size={14}
      aria-label="Indexed"
    />
  );
}

// ─── Add Source Dialog ────────────────────────────────────────────────────────

type AddSourceDialogProps = {
  conversationId: string;
  onClose: () => void;
};

function AddSourceDialog({ conversationId, onClose }: AddSourceDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"file" | "youtube" | "website">(
    "file"
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = ".pdf,.txt,.vtt,.ppt,.pptx,.md";

  async function uploadFile(file: File) {
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("conversationId", conversationId);

      const res = await fetch("/api/sources/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Upload failed");
      }

      toast.success(`"${file.name}" is being indexed`);
      onClose();
    } catch (err) {
      toast.error(String(err instanceof Error ? err.message : err));
    } finally {
      setIsUploading(false);
    }
  }

  async function submitYoutube() {
    if (!youtubeUrl.trim()) return;
    setIsUploading(true);
    try {
      const res = await fetch("/api/sources/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl, conversationId }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to add YouTube source");
      }

      toast.success("YouTube video is being indexed");
      onClose();
    } catch (err) {
      toast.error(String(err instanceof Error ? err.message : err));
    } finally {
      setIsUploading(false);
    }
  }

  async function submitWebsite() {
    if (!websiteUrl.trim()) return;
    setIsUploading(true);
    try {
      const res = await fetch("/api/sources/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl, conversationId }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to add website");
      }

      toast.success("Website is being indexed");
      onClose();
    } catch (err) {
      toast.error(String(err instanceof Error ? err.message : err));
    } finally {
      setIsUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void uploadFile(file);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {(["file", "youtube", "website"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === tab
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "file" ? "File" : tab === "youtube" ? "YouTube" : "Website"}
          </button>
        ))}
      </div>

      {/* File tab */}
      {activeTab === "file" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <UploadCloudIcon className="size-10 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">Drop file here or click to browse</p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, TXT, VTT, PPT/PPTX, Markdown
            </p>
          </div>
          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="animate-spin size-4" />
              Uploading…
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={acceptedTypes}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadFile(file);
            }}
          />
        </div>
      )}

      {/* YouTube tab */}
      {activeTab === "youtube" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
            <PlayCircleIcon className="size-4 text-red-500 shrink-0" />
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            We&apos;ll extract the transcript and index it with timestamps so
            you can jump to exact moments.
          </p>
          <Button
            onClick={() => void submitYoutube()}
            disabled={!youtubeUrl.trim() || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2Icon className="animate-spin size-4" />
                Adding…
              </>
            ) : (
              "Add YouTube video"
            )}
          </Button>
        </div>
      )}

      {/* Website tab */}
      {activeTab === "website" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
            <LinkIcon className="size-4 text-muted-foreground shrink-0" />
            <input
              type="url"
              placeholder="https://example.com/article"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            We&apos;ll crawl the page content and index it for RAG retrieval.
          </p>
          <Button
            onClick={() => void submitWebsite()}
            disabled={!websiteUrl.trim() || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2Icon className="animate-spin size-4" />
                Adding…
              </>
            ) : (
              "Add website"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Source List Item ─────────────────────────────────────────────────────────

function SourceListItem({
  source,
  conversationId,
}: {
  source: SourceItem;
  conversationId: string;
}) {
  const deleteSource = useDeleteSource(conversationId);

  return (
    <div className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <SourceIcon type={source.type} className="text-muted-foreground" />
        <span className="truncate text-xs">{source.name}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <StatusBadge status={source.status} />
        <button
          type="button"
          aria-label="Remove source"
          onClick={() => deleteSource.mutate(source.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-destructive"
        >
          <Trash2Icon size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Main SourcesSidebar Component ───────────────────────────────────────────

export function SourcesSidebar({
  conversationId,
  className,
}: {
  conversationId: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { data: sources, isLoading } = useSources(conversationId);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-3 border-b shrink-0">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Sources
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="w-full gap-2 h-8 text-sm" variant="default" />
            }
          >
            <PlusIcon size={14} />
            Add Source
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a source</DialogTitle>
            </DialogHeader>
            <AddSourceDialog
              conversationId={conversationId}
              onClose={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Sources list */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2 p-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-full" />
            ))}
          </div>
        ) : !sources?.length ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center px-4">
            <FileTextIcon className="size-8 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              No sources yet. Add a PDF, YouTube video, or website to get
              started.
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {sources.map((source) => (
              <SourceListItem
                key={source.id}
                source={source}
                conversationId={conversationId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
