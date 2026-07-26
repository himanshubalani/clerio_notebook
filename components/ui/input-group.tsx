"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

// InputGroup container
export function InputGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "flex items-center rounded-lg border border-input bg-background ring-offset-background",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0",
        "has-[textarea]:items-end",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Addon (for icons or buttons at the edges)
export function InputGroupAddon({
  className,
  align = "inline-start",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: "inline-start" | "inline-end";
}) {
  return (
    <div
      data-icon={align}
      className={cn(
        "flex shrink-0 items-center px-2 text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Textarea inside the group
export const InputGroupTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex-1 resize-none bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground",
      "focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      "field-sizing-content", // modern auto-resize
      className
    )}
    {...props}
  />
));
InputGroupTextarea.displayName = "InputGroupTextarea";

// Input inside the group
export const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground",
      "focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
InputGroupInput.displayName = "InputGroupInput";

// Button inside the group
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

export function InputGroupButton({
  className,
  ...props
}: React.ComponentProps<typeof Button> &
  VariantProps<typeof buttonVariants>) {
  return <Button className={cn(className)} {...props} />;
}
