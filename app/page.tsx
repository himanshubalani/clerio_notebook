import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpenIcon,
  BrainCircuitIcon,
  FileTextIcon,
  PlayCircleIcon,
  GlobeIcon,
  ZapIcon,
  QuoteIcon,
  ArrowRightIcon,
} from "lucide-react";

/**
 * Public landing page. Signed-in users are sent straight into the app.
 */
export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/app");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary/10">
              <BookOpenIcon className="size-4 text-primary" />
            </span>
            <span className="font-semibold tracking-tight text-sm">
              Clerio Notebook
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get started
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground mb-6">
          <ZapIcon className="size-3 text-primary" />
          Powered by RAG + OpenAI
        </div>

        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Chat with your{" "}
          <span className="text-primary">research sources</span>
        </h1>

        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Drop in PDFs, YouTube videos, or websites. Ask questions. Get answers
          with clickable citations that jump right to the source.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start for free
            <ArrowRightIcon className="size-4" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center justify-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            See how it works
          </Link>
        </div>

        {/* App preview mockup */}
        <div className="mt-16 w-full max-w-4xl overflow-hidden rounded-2xl border bg-card shadow-2xl">
          <div className="flex h-8 items-center gap-1.5 border-b bg-muted/50 px-3">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-yellow-400" />
            <span className="size-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex h-72 sm:h-96">
            {/* Fake sources sidebar */}
            <div className="hidden w-48 shrink-0 border-r bg-sidebar p-3 sm:block">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Sources
              </p>
              <div className="mb-2 rounded-md bg-primary px-2 py-1.5 text-center text-[11px] font-medium text-primary-foreground">
                + Add Source
              </div>
              {[
                { icon: FileTextIcon, label: "DataStructures.pdf", status: "green" },
                { icon: PlayCircleIcon, label: "MIT 6.006 Lecture", status: "green" },
                { icon: GlobeIcon, label: "Wikipedia – Trees", status: "blue" },
              ].map(({ icon: Icon, label, status }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 rounded px-1.5 py-1 hover:bg-muted"
                >
                  <Icon className="size-3 shrink-0 text-muted-foreground" />
                  <span className="truncate text-[11px]">{label}</span>
                  <span
                    className={`ml-auto size-1.5 shrink-0 rounded-full ${
                      status === "green" ? "bg-green-500" : "bg-blue-400 animate-pulse"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Fake chat */}
            <div className="flex flex-1 flex-col">
              <div className="flex-1 space-y-3 overflow-hidden p-4 text-left">
                {/* User bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[70%] rounded-lg bg-secondary px-3 py-2 text-[12px]">
                    What is a binary search tree?
                  </div>
                </div>
                {/* Assistant reply */}
                <div className="max-w-[85%] space-y-1">
                  <p className="text-[12px] leading-relaxed">
                    A binary search tree (BST) is a data structure where each node has at
                    most two children.{" "}
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      DataStructures.pdf p.45
                    </span>{" "}
                    The left subtree contains only nodes with values less than the
                    parent.{" "}
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      MIT 6.006 12:30
                    </span>
                  </p>
                </div>
              </div>
              {/* Fake composer */}
              <div className="border-t p-3">
                <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-2">
                  <span className="flex-1 text-[12px] text-muted-foreground">
                    Ask a follow-up…
                  </span>
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary">
                    <ArrowRightIcon className="size-3 text-primary-foreground" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="border-t bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Everything you need to research smarter
          </h2>
          <p className="mb-12 text-center text-muted-foreground">
            Drop in your sources, ask questions, and let the AI connect the dots.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border bg-background p-6 shadow-sm"
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <p className="mb-12 text-muted-foreground">
            Three steps to a smarter research workflow.
          </p>

          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map(({ step, title, description }) => (
              <div key={step} className="flex flex-col items-center gap-3 text-center">
                <div className="flex size-10 items-center justify-center rounded-full border-2 border-primary text-sm font-bold text-primary">
                  {step}
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="border-t bg-primary/5 px-4 py-20 text-center">
        <QuoteIcon className="mx-auto mb-4 size-8 text-primary/40" />
        <h2 className="mx-auto mb-4 max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
          Stop reading. Start understanding.
        </h2>
        <p className="mb-8 text-muted-foreground">
          Join researchers, students, and learners using Clerio Notebook.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Create your first notebook
          <ArrowRightIcon className="size-4" />
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t px-4 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Clerio Notebook · Built with Next.js &amp; Prisma
      </footer>
    </div>
  );
}

// ─── Static data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: FileTextIcon,
    title: "Multi-format sources",
    description:
      "Upload PDFs, paste YouTube links, add websites, VTT subtitles, or plain text. We index everything.",
  },
  {
    icon: QuoteIcon,
    title: "Clickable citations",
    description:
      "Every AI answer includes citation pills. Click one to jump straight to the exact page or timestamp.",
  },
  {
    icon: PlayCircleIcon,
    title: "Video timestamps",
    description:
      "Ask a question about a 3-hour lecture. We find the exact moment and play it for you.",
  },
  {
    icon: BrainCircuitIcon,
    title: "Advanced RAG",
    description:
      "Multi-query retrieval with HyDE and Reciprocal Rank Fusion gives you the most relevant chunks every time.",
  },
  {
    icon: GlobeIcon,
    title: "Website crawling",
    description:
      "Paste any URL and we'll fetch, chunk, and index the content so you can ask questions about it.",
  },
  {
    icon: ZapIcon,
    title: "Real-time streaming",
    description:
      "Answers stream in token by token. No waiting for the full response before you start reading.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Add your sources",
    description:
      "Drop in PDFs, YouTube links, websites, or text files. We index them all automatically.",
  },
  {
    step: "2",
    title: "Ask anything",
    description:
      "Type your question. The AI searches your sources and builds a grounded answer.",
  },
  {
    step: "3",
    title: "Explore citations",
    description:
      "Click any citation pill to jump to the exact page or video timestamp that backs up the answer.",
  },
];
