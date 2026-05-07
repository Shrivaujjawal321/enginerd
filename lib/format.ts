/* ============================================================================
 *  Centralised user-facing formatters.
 *
 *  Single source of truth for INR + date display. Always render in `en-IN`
 *  so SSR / client output match (no "renders as UTC on server, IST on
 *  client" hydration drift) and number grouping is `1,00,000` Indian style.
 * ============================================================================
 */

const IN = "en-IN";

/**
 *  Format paise as Indian Rupees with proper Indian number grouping.
 *  e.g. 29900 → "₹299", 249900 → "₹2,499", 12345678 → "₹1,23,456.78"
 */
export function formatINR(paise: number): string {
  const rupees = paise / 100;
  const isWhole = paise % 100 === 0;
  return isWhole
    ? `₹${rupees.toLocaleString(IN, { maximumFractionDigits: 0 })}`
    : `₹${rupees.toLocaleString(IN, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
}

/** Day-Mon-Year e.g. "2 May 2026". Returns "—" for null. */
export function formatDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return d.toLocaleDateString(IN, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Date + time e.g. "2 May 2026, 6:42 pm". Returns "—" for null. */
export function formatDateTime(d: Date | null | undefined): string {
  if (!d) return "—";
  return d.toLocaleString(IN, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Compact relative-or-absolute date for activity feeds. */
export function formatRelative(d: Date | null | undefined): string {
  if (!d) return "—";
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return formatDate(d);
}
