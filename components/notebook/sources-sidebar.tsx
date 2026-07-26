import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, FileTextIcon, YoutubeIcon, GlobeIcon, Loader2Icon, CheckCircleIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Dummy data: Replace with a fetch to your database/Prisma
const DUMMY_SOURCES = [
  { id: 1, name: "Data Structures PPT.pdf", type: "pdf", status: "COMPLETED" },
  { id: 2, name: "MIT 6.006 - Trees", type: "youtube", status: "COMPLETED" },
  { id: 3, name: "Advanced Graphs", type: "text", status: "INDEXING" },
];

export function SourcesSidebar({ className }: { className?: string }) {
  const [isUploading, setIsUploading] = useState(false);

  // Send file to the Next.js API route we built earlier
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetch("/api/index", { method: "POST", body: formData });
      // In a real app, refresh the sources list here
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="p-4 border-b">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full gap-2 font-medium">
              <PlusIcon size={16} /> Add Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new source</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 pt-4">
              {/* File Upload Dropzone Simulation */}
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <FileTextIcon className="mb-2 text-muted-foreground" />
                <span className="text-sm font-medium">Upload PDF/VTT</span>
                <input type="file" className="hidden" accept=".pdf,.vtt,.txt" onChange={handleFileUpload} />
              </label>

              {/* YouTube Link Input Simulation */}
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <YoutubeIcon className="mb-2 text-muted-foreground" />
                <span className="text-sm font-medium">YouTube Link</span>
              </label>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {DUMMY_SOURCES.map((source) => (
          <div key={source.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted text-sm">
            <div className="flex items-center gap-2 truncate">
              {source.type === "pdf" ? <FileTextIcon size={14} /> : <YoutubeIcon size={14} />}
              <span className="truncate">{source.name}</span>
            </div>
            {source.status === "INDEXING" ? (
              <Loader2Icon className="animate-spin text-blue-500" size={14} />
            ) : (
              <CheckCircleIcon className="text-green-500" size={14} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}