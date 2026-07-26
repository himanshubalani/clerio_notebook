import { BookOpenIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/** Empty-state placeholder shown before the first message is sent. */
export function ChatEmpty() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <Empty className="border-0 max-w-sm">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpenIcon />
          </EmptyMedia>
          <EmptyTitle className="text-2xl tracking-tight">
            Ask your sources anything
          </EmptyTitle>
          <EmptyDescription>
            Add sources on the left, then ask questions. Answers will include
            citations you can click to jump directly to the source.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
