"use client";

import { Menu } from "@base-ui/react/menu";
import { cn } from "@/lib/utils";
import * as React from "react";

function DropdownMenu(props: React.ComponentProps<typeof Menu.Root>) {
  return <Menu.Root {...props} />;
}

function DropdownMenuTrigger({
  children,
  render,
  ...props
}: React.ComponentProps<typeof Menu.Trigger>) {
  return (
    <Menu.Trigger render={render} {...props}>
      {children}
    </Menu.Trigger>
  );
}

function DropdownMenuContent({
  className,
  align = "start",
  side = "bottom",
  children,
  ...props
}: React.ComponentProps<typeof Menu.Popup> & {
  align?: "start" | "end" | "center";
  side?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <Menu.Portal>
      <Menu.Positioner align={align} side={side} sideOffset={6}>
        <Menu.Popup
          className={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-md",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity duration-150",
            className
          )}
          {...props}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

function DropdownMenuItem({
  className,
  variant,
  children,
  onClick,
  ...props
}: React.ComponentProps<typeof Menu.Item> & {
  variant?: "default" | "destructive";
}) {
  return (
    <Menu.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
        "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        variant === "destructive" && "text-destructive data-[highlighted]:bg-destructive/10",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Menu.Item>
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Menu.Separator>) {
  return (
    <Menu.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function DropdownMenuLabel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-2 py-1.5 text-xs font-medium text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
