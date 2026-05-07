"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/shared/wordmark";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/roadmaps", label: "Roadmaps" },
  { href: "/subjects", label: "Subjects" },
  { href: "/practice", label: "Practice" },
  { href: "/changelog", label: "Changelog" },
  { href: "/about", label: "About" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "border-b border-white/[0.06] bg-[#0a0a0f]/70 backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Wordmark size="md" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Get started</Button>
            </Link>
          </div>

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-200 hover:bg-white/[0.05] md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[100] md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col gap-1 border-l border-white/[0.08] bg-[#0a0a0f]/90 p-6 backdrop-blur-2xl">
            <div className="mb-4 flex items-center justify-between">
              <Wordmark size="md" />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 hover:bg-white/[0.05]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-base text-slate-200 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t border-white/[0.06] pt-4">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="glass" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Get started</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
