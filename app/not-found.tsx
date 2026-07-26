import Link from "next/link";
import { BookOpenIcon, HomeIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <BookOpenIcon className="size-8 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <h1 className="text-5xl font-bold tracking-tight">404</h1>
        <h2 className="text-xl font-semibold">Page not found</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          The notebook or page you&apos;re looking for doesn&apos;t exist or
          has been deleted.
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <HomeIcon className="size-4" />
        Back to home
      </Link>
    </div>
  );
}
