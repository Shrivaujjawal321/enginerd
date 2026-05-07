"use client";

import * as React from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Bell,
  ChevronDown,
  CreditCard,
  Flame,
  LogOut,
  Search,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { SearchPalette } from "@/components/dashboard/search-palette";
import { cn } from "@/lib/utils";

/* ============================================================================
 * Topbar — Phase 4: real session, real streak, real sign-out.
 *
 * Replaces the hardcoded "Test User" + "12-day streak" placeholders.
 *   - Avatar/name pulled from `useSession()`.
 *   - Streak fetched from /api/me on mount + refreshed every 5 min.
 *   - Sign-out routes through NextAuth's `signOut()` helper, redirects to /.
 * ============================================================================
 */

type Me = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    image: string | null;
  };
  stats: {
    currentStreak: number;
    longestStreak: number;
    subjectsCompleted: number;
    subjectsInProgress: number;
  };
};

export function Topbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = React.useState(false);
  // Refs used by the topbar dropdown's keyboard a11y behavior (cycle 14).
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuListRef = React.useRef<HTMLDivElement | null>(null);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [me, setMe] = React.useState<Me | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  // Fetch /api/me for the streak. Refresh every 5 min — streaks change after
  // a "Mark complete" elsewhere on the dashboard.
  React.useEffect(() => {
    if (!session?.user?.id) {
      setMe(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Me;
        if (!cancelled) setMe(data);
      } catch {
        // silent — topbar shouldn't toast on a stats fetch failure
      }
    };
    void load();
    const id = setInterval(load, 5 * 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [session?.user?.id]);

  // Close dropdown on outside click OR Escape key, and return focus to the
  // trigger so keyboard users land back where they came from. WCAG 2.1.1 +
  // 2.1.2 — without Escape, the menu is a keyboard trap.
  React.useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // When the menu opens via keyboard, focus the first menuitem so screen
  // reader / sighted keyboard users land on something interactive immediately.
  React.useEffect(() => {
    if (!menuOpen) return;
    const first = menuListRef.current?.querySelector<HTMLElement>(
      '[role="menuitem"]',
    );
    first?.focus();
  }, [menuOpen]);

  /**
   *  Arrow-key navigation between menuitems. Up/Down cycle within the
   *  visible items; Home/End jump to first/last; Tab closes the menu.
   */
  const onMenuKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (!menuListRef.current) return;
    const items = Array.from(
      menuListRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    if (items.length === 0) return;
    const idx = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[(idx + 1 + items.length) % items.length];
      next?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[(idx - 1 + items.length) % items.length];
      prev?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  }, []);

  // Cmd+K / Ctrl+K opens search palette globally.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onSignOut = async () => {
    setMenuOpen(false);
    toast.success("Signed out. See you soon.");
    await signOut({ callbackUrl: "/" });
  };

  const user = session?.user;
  const displayName =
    user?.name ?? (user?.email ? user.email.split("@")[0] : null) ?? user?.phone ?? "You";
  const initial = (displayName ?? "?").trim().charAt(0).toUpperCase();
  const streak = me?.stats.currentStreak ?? 0;

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0a0f]/70 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className={cn(
            "flex h-10 flex-1 items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-left text-sm text-slate-400 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-slate-300 sm:max-w-md",
          )}
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 truncate">
            Search roadmaps, subjects, problems…
          </span>
          <kbd className="hidden rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-slate-400 sm:inline">
            ⌘K
          </kbd>
        </button>

        <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />

        {streak > 0 ? (
          <Badge
            variant="warning"
            className="hidden items-center gap-1.5 sm:inline-flex"
            aria-label={`${streak}-day streak`}
          >
            <Flame className="h-3.5 w-3.5" />
            {streak}-day streak
          </Badge>
        ) : null}

        <button
          type="button"
          aria-label="Notifications"
          onClick={() => toast.info("No new notifications.")}
          className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex h-10 items-center gap-2 rounded-xl pl-1 pr-3 text-slate-200 transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
          >
            {user?.image ? (
              // Tiny avatar — `unoptimized` avoids the Vercel optimizer cost
              // for 32×32 thumbnails. Fixed width/height eliminates CLS that
              // the prior raw <img> had.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={displayName ?? "Profile"}
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-sm font-semibold text-white"
              >
                {initial}
              </span>
            )}
            <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
              {displayName}
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 sm:inline" />
          </button>
          {menuOpen ? (
            <div
              ref={menuListRef}
              role="menu"
              tabIndex={-1}
              onKeyDown={onMenuKeyDown}
              className="glass absolute right-0 top-12 w-60 overflow-hidden rounded-xl"
            >
              <div className="border-b border-white/[0.05] px-4 py-3">
                <p className="truncate text-sm font-medium text-slate-100">
                  {displayName}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {user?.email ?? user?.phone ?? "—"}
                </p>
                {me ? (
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    {me.stats.subjectsCompleted} subjects ·{" "}
                    {me.stats.currentStreak}d streak
                  </p>
                ) : null}
              </div>
              <Link
                href="/profile"
                role="menuitem"
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/[0.05]"
                onClick={() => setMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Link
                href="/billing"
                role="menuitem"
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/[0.05]"
                onClick={() => setMenuOpen(false)}
              >
                <CreditCard className="h-4 w-4" />
                Billing
              </Link>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2.5 border-t border-white/[0.05] px-4 py-2.5 text-sm text-rose-300 hover:bg-rose-500/10"
                onClick={() => void onSignOut()}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
