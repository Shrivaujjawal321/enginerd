import Link from "next/link";
import { GradientText } from "@/components/shared/gradient-text";

/**
 * Two-column footer (Product + Legal) — every link points at a real route.
 * Cycle 19 cleanup: dropped the speculative "Resources" + "Company" columns
 * and the placeholder social icons that all linked to "#"; users were left
 * with dead clicks. Add columns back when those pages actually exist.
 */
const COLUMNS: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: "Product",
    links: [
      { label: "Roadmaps", href: "/roadmaps" },
      { label: "Subjects", href: "/subjects" },
      { label: "DSA Practice", href: "/practice" },
      { label: "Careers", href: "/careers" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Build log",
    links: [
      { label: "Changelog", href: "/changelog" },
      { label: "Agent pipeline (deep-dive)", href: "/posts/agent-pipeline" },
      { label: "About me", href: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Refunds", href: "/refunds" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-xl font-bold tracking-tight"
            >
              Engi<GradientText>Nerd</GradientText>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-slate-400">
              The Hinglish-first learning platform built for Indian engineering
              students and early-career developers.
            </p>
            <p className="mt-6 text-xs text-slate-400">
              Questions? Write to{" "}
              <a
                href="mailto:hello@enginerd.in"
                className="text-slate-300 transition-colors hover:text-white"
              >
                hello@enginerd.in
              </a>
              .
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-300">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-white/[0.06] pt-6 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>© 2026 EngiNerd. Made with chai in Bengaluru.</p>
          <p>Built for engineers, by engineers.</p>
        </div>
      </div>
    </footer>
  );
}
