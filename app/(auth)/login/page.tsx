import type { Metadata } from "next";
import { Suspense } from "react";
import { GlassCard } from "@/components/shared/glass-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your EngiNerd account.",
};

export default function LoginPage() {
  return (
    <GlassCard strong className="px-7 py-10 sm:px-9 sm:py-12">
      <header className="mb-7 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
          Welcome back.
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Continue with phone, email, or Google.
        </p>
      </header>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </GlassCard>
  );
}
