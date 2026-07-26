"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";
import * as React from "react";

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function Tooltip({
  children,
  open,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      delay={300}
      {...props}
    >
      {children}
    </TooltipPrimitive.Root>
  );
}

function TooltipTrigger({
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return (
    <TooltipPrimitive.Trigger {...props}>
      {children}
    </TooltipPrimitive.Trigger>
  );
}

function TooltipContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Popup>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner>
        <TooltipPrimitive.Popup
          className={cn(
            "z-50 rounded-md bg-foreground px-2.5 py-1 text-xs text-background shadow-md",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity",
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
