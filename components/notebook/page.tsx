"use client";

import { useState } from "react";
import { SourcesSidebar } from "@/components/notebook/citation-viewer"
import { ChatArea } from "@/components/notebook/chat-area";
import { CitationViewer } from "@/components/notebook/sources-sidebar";

export default function NotebookPage() {
  const [activeCitation, setActiveCitation] = useState<any | null>(null);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Left Panel: Sources */}
      <SourcesSidebar className="w-80 border-r" />

      {/* Center Panel: Chat */}
      <ChatArea 
        className="flex-1 flex flex-col" 
        onCitationClick={(citation) => setActiveCitation(citation)} 
      />

      {/* Right Panel: Citation Viewer (Only shows if a citation is clicked) */}
      {activeCitation && (
        <CitationViewer 
          citation={activeCitation} 
          onClose={() => setActiveCitation(null)} 
          className="w-96 border-l bg-muted/20 shadow-xl" 
        />
      )}
    </div>
  );
}