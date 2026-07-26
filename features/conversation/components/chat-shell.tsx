"use client";

import { AppSidebar } from "@/features/conversation/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/**
 * Full-viewport shell: collapsible notebook sidebar + main content area.
 */
export function ChatShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-full">
      <AppSidebar />
      <SidebarInset className="h-full overflow-hidden">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
