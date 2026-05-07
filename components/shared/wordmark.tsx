import { LogoSvg } from "@/components/shared/logo-svg";
import { cn } from "@/lib/utils";

type WordmarkProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Show only the bracket mark (no text) — used in compact spots. */
  compact?: boolean;
  /** Override the rendered logo size in pixels. */
  iconSize?: number;
};

/**
 * Canonical EngiNerd wordmark.
 *
 * Single source of truth for the bracket mark + "EngiNerd" wordmark used in
 * the topbar, marketing nav, sidebar, footer, and OG images. Replaces the
 * ad-hoc `<GradientText>Nerd</GradientText>` lockup that was duplicated in
 * 4+ places before Phase 4.
 */
export function Wordmark({
  className,
  size = "md",
  compact = false,
  iconSize,
}: WordmarkProps) {
  const sizeClasses = {
    sm: "text-sm gap-1.5",
    md: "text-base gap-2",
    lg: "text-2xl gap-3",
  } as const;

  const iconPx = iconSize ?? (size === "sm" ? 18 : size === "md" ? 22 : 36);

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold tracking-tight text-slate-50",
        sizeClasses[size],
        className,
      )}
    >
      <LogoSvg size={iconPx} className="shrink-0" />
      {compact ? null : (
        <span>
          Engi
          <span className="gradient-text-primary">Nerd</span>
        </span>
      )}
    </span>
  );
}
