import { z } from "zod";

/**
 * E.164 phone validator — accepts +countrycode + 6-15 digits.
 * Defaults to Indian +91 if user supplies a 10-digit number with no prefix.
 */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^\+\d{6,15}$/.test(v) || /^\d{10}$/.test(v), {
    message: "Phone must be in +91XXXXXXXXXX format",
  })
  .transform((v) => (v.startsWith("+") ? v : `+91${v}`));

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "OTP must be 6 digits");

export const sendPhoneOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyPhoneOtpSchema = z.object({
  phone: phoneSchema,
  code: otpCodeSchema,
});

export const sendEmailOtpSchema = z.object({
  email: emailSchema,
});

export const verifyEmailOtpSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
});
