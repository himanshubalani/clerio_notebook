import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";

export function Spinner({
  className,
  size = 14,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { size?: number }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <Loader2Icon className="animate-spin" size={size} />
    </span>
  );
}
