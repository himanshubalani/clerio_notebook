"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { PanelLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type SidebarContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  state: "expanded" | "collapsed";
};

const SidebarContext = React.createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function SidebarProvider({
  defaultOpen = true,
  children,
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { defaultOpen?: boolean }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);

  const state = open ? "expanded" : "collapsed";

  return (
    <SidebarContext.Provider
      value={{ open, setOpen, openMobile, setOpenMobile, isMobile, state }}
    >
      <div
        data-sidebar-provider=""
        className={cn("flex min-h-svh w-full", className)}
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "3rem",
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        className={cn(
          "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <>
        {/* Mobile drawer overlay */}
        {openMobile && (
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpenMobile(false)}
          />
        )}
        <div
          data-sidebar="sidebar"
          data-state={openMobile ? "expanded" : "collapsed"}
          className={cn(
            "fixed inset-y-0 z-50 flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300",
            side === "left" ? "left-0" : "right-0",
            openMobile
              ? "translate-x-0"
              : side === "left"
              ? "-translate-x-full"
              : "translate-x-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </>
    );
  }

  return (
    <div
      data-state={state}
      data-collapsible={collapsible}
      className={cn(
        "group peer hidden md:block text-sidebar-foreground",
        "duration-300 transition-[width] ease-in-out",
        state === "expanded"
          ? "w-[--sidebar-width]"
          : collapsible === "icon"
          ? "w-[--sidebar-width-icon]"
          : "w-0",
        className
      )}
      {...props}
    >
      <div
        data-sidebar="sidebar"
        className={cn(
          "flex h-full flex-col bg-sidebar overflow-hidden",
          variant === "inset" && "rounded-xl border border-sidebar-border shadow-sm"
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ─── SidebarInset ─────────────────────────────────────────────────────────────

export function SidebarInset({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <main
      className={cn("relative flex flex-1 flex-col overflow-hidden", className)}
      {...props}
    />
  );
}

// ─── SidebarTrigger ───────────────────────────────────────────────────────────

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { isMobile, open, setOpen, openMobile, setOpenMobile } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event);
        if (isMobile) {
          setOpenMobile(!openMobile);
        } else {
          setOpen(!open);
        }
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

export function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

export function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-2 mt-auto", className)}
      {...props}
    />
  );
}

export function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-1 flex-col overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  );
}

export function SidebarGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1 p-2", className)}
      {...props}
    />
  );
}

export function SidebarGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mb-1 px-2 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  );
}

export function SidebarGroupContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function SidebarRail({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = useSidebar();
  return (
    <div
      title={open ? "Collapse sidebar" : "Expand sidebar"}
      className={cn(
        "absolute inset-y-0 right-0 w-1 cursor-col-resize bg-transparent hover:bg-sidebar-border transition-colors",
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    />
  );
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  );
}

export function SidebarMenuItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

export function SidebarMenuButton({
  className,
  isActive = false,
  size = "default",
  tooltip,
  render,
  children,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean;
  size?: "default" | "lg";
  tooltip?: string;
  render?: React.ReactElement;
}) {
  const Comp = render ? "span" : "button";

  const buttonContent = (
    <Comp
      data-active={isActive}
      className={cn(
        "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm outline-none transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        "active:bg-sidebar-accent active:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
        size === "lg" ? "h-10 text-sm" : "h-8 text-sm",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );

  if (render) {
    return React.cloneElement(render, {
      className: cn(
        "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm outline-none transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium",
        "group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
        size === "lg" ? "h-10" : "h-8",
        isActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
        render.props.className,
        className
      ),
      "data-active": isActive,
      children: render.props.children ?? children,
    });
  }

  return buttonContent;
}

export function SidebarMenuAction({
  className,
  showOnHover = false,
  children,
  render,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & {
  showOnHover?: boolean;
  render?: React.ReactElement;
}) {
  const classes = cn(
    "absolute right-1 top-1/2 -translate-y-1/2 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-transform",
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    "focus-visible:ring-2",
    "peer-hover/menu-button:text-sidebar-accent-foreground",
    showOnHover &&
      "opacity-0 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100",
    className
  );

  if (render) {
    return React.cloneElement(render, {
      className: cn(classes, render.props.className),
      children: render.props.children ?? children,
    });
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
