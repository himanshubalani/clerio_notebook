"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "bg-background border border-border text-foreground shadow-md",
          error: "text-destructive",
          success: "text-green-600 dark:text-green-400",
        },
      }}
    />
  );
}
