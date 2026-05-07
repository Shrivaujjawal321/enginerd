/**
 * Auth-related shared types & enums.
 *
 * Phase 1 dropped passwords entirely — sign-in is OTP (phone/email) or
 * Google OAuth only. Login/register form-level validators live in
 * `lib/validators/otp.ts`. The constants below are kept because the profile
 * page reuses YEAR_OPTIONS.
 */

export const YEAR_OPTIONS = [
  "1st year",
  "2nd year",
  "3rd year",
  "4th year",
  "Graduated",
  "Working",
] as const;

export type YearOption = (typeof YEAR_OPTIONS)[number];
