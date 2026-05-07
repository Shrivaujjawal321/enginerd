import Link from "next/link";
import { AnimatedOrbs } from "@/components/shared/animated-orbs";
import { Wordmark } from "@/components/shared/wordmark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

      <main className="relative flex min-h-screen flex-col items-center justify-center px-5 py-20 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </>
  );
}
