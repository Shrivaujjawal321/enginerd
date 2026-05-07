import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-violet-300">
        404
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-[-0.02em] text-slate-50 sm:text-5xl">
        Page not found.
      </h1>
      <p className="mt-3 max-w-md text-center text-sm text-slate-400">
        The URL might be wrong, or this page hasn&apos;t shipped yet. Head
        back — there&apos;s plenty more to explore.
      </p>
      <div className="mt-8 flex items-center gap-2">
        <Link href="/">
          <Button variant="glass">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Button>
        </Link>
        <Link href="/roadmaps">
          <Button>
            <Search className="h-4 w-4" />
            Explore roadmaps
          </Button>
        </Link>
      </div>
    </div>
  );
}
