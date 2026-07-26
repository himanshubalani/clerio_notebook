import { onBoard } from "@/features/auth/action/onboard";
import { ChatShell } from "@/features/conversation/components/chat-shell";
import { auth } from "@clerk/nextjs/server";
import React from "react";

/**
 * Authenticated app layout — protects routes, syncs user to DB,
 * and wraps content in the notebook ChatShell.
 */
const AppGroupLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  await auth.protect();
  await onBoard();

  return (
    <div className="flex h-full flex-col">
      <ChatShell>{children}</ChatShell>
    </div>
  );
};

export default AppGroupLayout;
