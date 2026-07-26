import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CitationViewer({ citation, onClose, className }: { citation: any, onClose: () => void, className?: string }) {
  
  // Logic to render the exact embed
  const renderViewer = () => {
    if (citation.type === "pdf") {
      // Browsers support jumping to a PDF page natively via #page=X
      return (
        <iframe 
          src={`/uploads/${citation.fileName}#page=${citation.page}`} 
          className="w-full h-full border-0"
        />
      );
    }
    
    if (citation.type === "youtube") {
      // YouTube supports jumping to timestamps via ?start=X (in seconds)
      return (
        <iframe 
          src={`https://www.youtube.com/embed/${citation.videoId}?start=${citation.timestamp}&autoplay=1`} 
          className="w-full aspect-video"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      );
    }

    return <div className="p-4 text-sm whitespace-pre-wrap">{citation.text}</div>;
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div>
          <h3 className="font-medium text-sm">{citation.sourceName}</h3>
          <p className="text-xs text-muted-foreground">
            {citation.type === "pdf" ? `Page ${citation.page}` : `Timestamp: ${citation.formattedTime}`}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XIcon size={16} />
        </Button>
      </div>
      
      <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        {renderViewer()}
      </div>
      
      {/* Context preview text below the visual viewer */}
      <div className="h-1/3 p-4 overflow-y-auto border-t bg-background text-sm">
        <p className="font-semibold mb-2 text-xs text-muted-foreground">Extracted Segment:</p>
        "{citation.text}"
      </div>
    </div>
  );
}