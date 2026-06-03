import type { Metadata } from "next";
import { Suspense } from "react";
import { GlassCard } from "@/components/shared/glass-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Sign up for EngiNerd — phone, email, or Google.",
};

export default function RegisterPage() {
  return (
    <GlassCard strong className="px-7 py-10 sm:px-9 sm:py-12">
      <header className="mb-7 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
          Create your account.
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign up with phone, email, or Google. No password to remember.
        </p>
      </header>
      <Suspense fallback={null}>
        <LoginForm mode="register" />
      </Suspense>
      <p className="mt-4 text-center text-[11px] text-slate-500">
        Your account is created the moment OTP verifies — no separate signup
        step.
      </p>
    </GlassCard>
  );
}
