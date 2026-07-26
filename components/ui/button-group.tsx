import { cn } from "@/lib/utils";
import * as React from "react";

export function ButtonGroup({
  className,
  orientation = "horizontal",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <div
      data-slot="button-group"
      className={cn(
        "inline-flex",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none",
        "[&>*:not(:first-child)]:border-l-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ButtonGroupText({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-input bg-background px-2 py-1 text-xs",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
