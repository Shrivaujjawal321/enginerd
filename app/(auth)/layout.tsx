import Link from "next/link";
import { AnimatedOrbs } from "@/components/shared/animated-orbs";
import { Wordmark } from "@/components/shared/wordmark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();
  return (
    <>
      <AnimatedOrbs variant="auth" />

      <header className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <Wordmark size="md" />
          </Link>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="relative flex min-h-screen flex-col items-center justify-center px-5 py-20 sm:px-8"
      >
        <div className="w-full max-w-md">{children}</div>
        <footer className="mt-10 w-full max-w-md text-center text-xs text-slate-400">
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link
              href="/terms"
              className="hover:text-slate-200"
            >
              Terms
            </Link>
            <span aria-hidden className="text-slate-600">·</span>
            <Link
              href="/privacy"
              className="hover:text-slate-200"
            >
              Privacy
            </Link>
            <span aria-hidden className="text-slate-600">·</span>
            <Link
              href="/refunds"
              className="hover:text-slate-200"
            >
              Refunds
            </Link>
            <span aria-hidden className="text-slate-600">·</span>
            <Link
              href="/contact"
              className="hover:text-slate-200"
            >
              Contact
            </Link>
          </p>
          <p className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <a
              href="mailto:hello@enginerd.in"
              aria-label="Email hello at enginerd dot in"
              className="font-medium tracking-wide text-slate-200 underline-offset-4 hover:text-white hover:underline"
            >
              hello@enginerd.in
            </a>
            <span aria-hidden className="text-slate-600">·</span>
            <span className="text-slate-400">© {year} EngiNerd</span>
          </p>
        </footer>
      </main>
    </>
  );
}
