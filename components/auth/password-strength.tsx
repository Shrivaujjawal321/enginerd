"use client";

import { cn } from "@/lib/utils";

type Strength = 0 | 1 | 2 | 3 | 4;

export function scorePassword(value: string): Strength {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
  return Math.min(score, 4) as Strength;
}

const LABELS = ["", "Weak", "Okay", "Good", "Strong"] as const;
const COLORS = [
  "bg-white/[0.05]",
  "bg-rose-400",
  "bg-amber-400",
  "bg-cyan-400",
  "bg-emerald-400",
];

type Props = {
  value: string;
  className?: string;
};

export function PasswordStrength({ value, className }: Props) {
  const score = scorePassword(value);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              bar <= score ? COLORS[score] : "bg-white/[0.06]",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-slate-400">
        {score === 0
          ? "Use at least 8 characters with a mix of letters, numbers, and symbols."
          : `Strength: ${LABELS[score]}`}
      </p>
    </div>
  );
}
