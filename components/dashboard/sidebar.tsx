"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Code2,
  Flame,
  LayoutDashboard,
  Map,
  Rocket,
  Settings,
  Sparkles,
  Target,
  Trophy,
  User,
} from "lucide-react";
import { Wordmark } from "@/components/shared/wordmark";
import { cn } from "@/lib/utils";

const PRIMARY = [
  { href: "/home", label: "Home", icon: LayoutDashboard },
  { href: "/roadmaps", label: "Roadmaps", icon: Map },
  { href: "/practice", label: "DSA Practice", icon: Code2 },
  { href: "/cohorts", label: "Cohorts", icon: Trophy },
  { href: "/careers", label: "Careers", icon: Briefcase },
];

/* Highest-leverage placement-prep roadmaps surfaced in the sidebar.
 * Ordered by total addressable audience (volume → product → portfolio). */
const PLACEMENT_TRACKS = [
  {
    href: "/roadmaps/tcs-nqt-cracker",
    label: "TCS NQT",
    icon: Target,
  },
  {
    href: "/roadmaps/service-company-cracker",
    label: "Service Cracker",
    icon: Rocket,
  },
  {
    href: "/roadmaps/product-company-cracker",
    label: "Product Cracker",
    icon: Flame,
  },
  {
    href: "/roadmaps/mern-stack-developer",
    label: "MERN Stack",
    icon: Code2,
  },
  {
    href: "/roadmaps/portfolio-builder",
    label: "Portfolio Builder",
    icon: Sparkles,
  },
];

const SECONDARY = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/profile", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  const path = href.split("?")[0];
  if (path === "/home") return pathname === "/home";
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-r border-white/[0.06] bg-[#0a0a0f]/60 backdrop-blur-xl md:flex md:flex-col">
      <div className="px-6 py-5">
        <Link
          href="/home"
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <Wordmark size="md" />
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {PRIMARY.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/[0.06] text-white before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[2px] before:-translate-y-1/2 before:rounded-full before:bg-violet-400"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active
                    ? "text-violet-300"
                    : "text-slate-400 group-hover:text-white",
                )}
              />
              {item.label}
            </Link>
          );
        })}

        <div className="my-3 h-px bg-white/[0.05]" />

        <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Placement Tracks
        </p>
        {PLACEMENT_TRACKS.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white/[0.06] text-white"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active
                    ? "text-violet-300"
                    : "text-slate-400 group-hover:text-white",
                )}
              />
              {item.label}
            </Link>
          );
        })}

        <div className="my-3 h-px bg-white/[0.05]" />

        {SECONDARY.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/[0.06] text-white"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-500/15 to-cyan-500/15 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-300" />
          <p className="text-sm font-semibold text-slate-100">Upgrade to Pro</p>
        </div>
        <p className="mt-1.5 text-xs text-slate-400">
          Unlock all roadmaps, MNC apply, and AI mentor.
        </p>
        <Link
          href="/#pricing"
          className="mt-3 inline-flex w-full items-center justify-center rounded-lg gradient-primary px-3 py-2 text-xs font-semibold text-white shadow-md shadow-violet-500/30 transition-transform hover:-translate-y-0.5"
        >
          See plans
        </Link>
      </div>
    </aside>
  );
}

export function MobileBottomTabs() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-[#0a0a0f]/85 backdrop-blur-xl md:hidden">
      {/* PRIMARY now has 5 items — grid-cols-5 fits all of them. */}
      <ul className="grid grid-cols-5">
        {PRIMARY.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium",
                  active ? "text-white" : "text-slate-400",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label.split(" ")[0]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
