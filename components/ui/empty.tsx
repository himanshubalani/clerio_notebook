import { cn } from "@/lib/utils";
import * as React from "react";

export function Empty({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border border-dashed p-8 text-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function EmptyHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col items-center gap-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function EmptyMedia({
  className,
  variant = "icon",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "icon" | "image" }) {
  return (
    <div
      className={cn(
        variant === "icon" &&
          "flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function EmptyTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function EmptyDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}
