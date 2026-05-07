"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Mail, Phone, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FieldError } from "@/components/auth/field-error";
import { SocialButtons } from "@/components/auth/social-buttons";
import { cn } from "@/lib/utils";

type Channel = "phone" | "email";
type Stage = "identifier" | "code";

const RESEND_COOLDOWN_S = 60;

function formatMmSs(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/home";

  const [channel, setChannel] = React.useState<Channel>("phone");

  return (
    <div className="space-y-5">
      <SocialButtons callbackUrl={callbackUrl} />
      <Separator label="or" />

      {/* Channel switcher */}
      <div
        role="tablist"
        aria-label="Sign in method"
        className="grid grid-cols-2 gap-1 rounded-xl border border-white/[0.06] bg-black/30 p-1"
      >
        <TabButton
          active={channel === "phone"}
          onClick={() => setChannel("phone")}
          icon={<Phone className="h-3.5 w-3.5" />}
        >
          Phone
        </TabButton>
        <TabButton
          active={channel === "email"}
          onClick={() => setChannel("email")}
          icon={<Mail className="h-3.5 w-3.5" />}
        >
          Email
        </TabButton>
      </div>

      <OtpFlow
        channel={channel}
        onSwitchChannel={setChannel}
        onSuccess={() => router.push(callbackUrl)}
      />
    </div>
  );
}

/* ----------------------- Tabs ------------------------------------------- */

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-white/[0.08] text-white"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/* ----------------------- OTP flow --------------------------------------- */

function OtpFlow({
  channel,
  onSwitchChannel,
  onSuccess,
}: {
  channel: Channel;
  onSwitchChannel: (c: Channel) => void;
  onSuccess: () => void;
}) {
  const [stage, setStage] = React.useState<Stage>("identifier");
  const [identifier, setIdentifier] = React.useState("");
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  const [devCode, setDevCode] = React.useState<string | null>(null);
  // When the API returns `rate_limited`, capture the absolute reset epoch
  // so we can render a live countdown rather than a "1 ghante" lie.
  const [rateLimitReset, setRateLimitReset] = React.useState<number | null>(
    null,
  );
  const [rateLimitTick, setRateLimitTick] = React.useState(0);

  // Reset whenever the channel toggles.
  React.useEffect(() => {
    setStage("identifier");
    setIdentifier("");
    setCode("");
    setError(null);
    setDevCode(null);
    setRateLimitReset(null);
  }, [channel]);

  // Cooldown timer for "resend OTP".
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Live tick for rate-limit countdown.
  React.useEffect(() => {
    if (rateLimitReset === null) return;
    if (rateLimitReset <= Date.now()) {
      setRateLimitReset(null);
      return;
    }
    const t = setTimeout(() => setRateLimitTick((x) => x + 1), 1000);
    return () => clearTimeout(t);
  }, [rateLimitReset, rateLimitTick]);

  const sendOtp = async (id: string) => {
    setBusy(true);
    setError(null);
    setDevCode(null);
    try {
      const path =
        channel === "phone"
          ? "/api/auth/otp/phone/send"
          : "/api/auth/otp/email/send";
      const body =
        channel === "phone" ? { phone: id } : { email: id };

      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        details?: { fieldErrors?: Record<string, string[]> };
        devCode?: string;
        reset?: number;
      };

      if (!res.ok) {
        if (data.error === "rate_limited") {
          if (typeof data.reset === "number") {
            setRateLimitReset(data.reset);
          }
          setError("RATE_LIMIT"); // sentinel — rendered specially below
        } else if (data.error === "validation") {
          const first = Object.values(data.details?.fieldErrors ?? {})[0]?.[0];
          setError(first ?? "Invalid input.");
        } else if (data.error === "send_failed") {
          setError("Couldn't send OTP. Provider issue — please try again.");
        } else {
          setError("Something went wrong. Please try again.");
        }
        return;
      }

      if (data.devCode) {
        // Dev mode (no MSG91/Resend creds) — show code right in the UI.
        setDevCode(data.devCode);
        toast.info("Dev mode: OTP shown in terminal and on screen.", {
          description: data.devCode,
        });
      } else {
        toast.success(
          channel === "phone"
            ? "OTP sent — enter it within 10 minutes."
            : "Check your inbox — enter the code within 10 minutes.",
        );
      }

      setStage("code");
      setCooldown(RESEND_COOLDOWN_S);
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await signIn(
        channel === "phone" ? "phone-otp" : "email-otp",
        {
          [channel]: identifier,
          code,
          redirect: false,
        },
      );

      if (result?.error || !result?.ok) {
        setError("Wrong or expired OTP. Resend a new one.");
        return;
      }

      toast.success("Welcome to EngiNerd 🚀");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const placeholder =
    channel === "phone" ? "98765 43210" : "you@enginerd.in";
  const label = channel === "phone" ? "Phone number" : "Email";
  const inputType = channel === "phone" ? "tel" : "email";
  const autoComplete = channel === "phone" ? "tel" : "email";

  // For the phone field we render a non-editable "+91" prefix inline.
  // User-typed leading "+91" or "91 " is stripped on input so the value
  // we send to the server is always 10 raw digits.
  const handlePhoneChange = (raw: string) => {
    const stripped = raw
      .replace(/^\+?91[\s-]?/i, "")
      .replace(/\D/g, "")
      .slice(0, 10);
    setIdentifier(stripped);
  };

  const rateLimitedSecs =
    rateLimitReset !== null
      ? Math.max(0, Math.ceil((rateLimitReset - Date.now()) / 1000))
      : 0;
  const isRateLimited = error === "RATE_LIMIT" && rateLimitedSecs > 0;
  const fieldError = error && error !== "RATE_LIMIT" ? error : undefined;
  const otherChannel: Channel = channel === "phone" ? "email" : "phone";

  return (
    <div className="space-y-4">
      {stage === "identifier" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendOtp(identifier);
          }}
          noValidate
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="otp-identifier" required>
              {label}
            </Label>
            {channel === "phone" ? (
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm font-medium text-slate-400">
                  +91
                </span>
                <Input
                  id="otp-identifier"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="tel"
                  placeholder={placeholder}
                  value={identifier}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  invalid={!!fieldError}
                  autoFocus
                  maxLength={10}
                  className="!pl-12 tracking-wider tabular-nums"
                />
              </div>
            ) : (
              <Input
                id="otp-identifier"
                type={inputType}
                autoComplete={autoComplete}
                placeholder={placeholder}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                invalid={!!fieldError}
                autoFocus
              />
            )}
            <FieldError id="otp-id-error" message={fieldError} />
            {isRateLimited ? (
              <div
                role="alert"
                className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-sm"
              >
                <p className="text-amber-200">
                  Too many attempts. Try again in{" "}
                  <span className="font-mono tabular-nums">
                    {formatMmSs(rateLimitedSecs)}
                  </span>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => onSwitchChannel(otherChannel)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-violet-300 hover:text-violet-200"
                >
                  Try with {channel === "phone" ? "email" : "phone"} instead →
                </button>
              </div>
            ) : null}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={
              busy ||
              isRateLimited ||
              (channel === "phone"
                ? identifier.length !== 10
                : identifier.length < 4)
            }
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending OTP…
              </>
            ) : (
              "Send OTP"
            )}
          </Button>

          <p className="pt-1 text-center text-xs text-slate-400">
            First time here? Your account is created the moment OTP verifies.
          </p>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void verifyOtp();
          }}
          noValidate
          className="space-y-4"
        >
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-slate-300">
            <span className="text-slate-400">OTP sent to: </span>
            <span className="font-medium text-slate-100">{identifier}</span>
            <button
              type="button"
              onClick={() => {
                setStage("identifier");
                setCode("");
                setError(null);
                setDevCode(null);
              }}
              className="ml-2 text-xs text-violet-300 hover:text-white"
            >
              change
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp-code" required>
              6-digit OTP
            </Label>
            <Input
              id="otp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              invalid={!!error}
              autoFocus
              className="text-center font-mono tracking-[0.5em] text-xl"
            />
            <FieldError id="otp-code-error" message={error ?? undefined} />
            {devCode ? (
              <p className="text-xs text-amber-300">
                Dev OTP: <span className="font-mono">{devCode}</span>
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={busy || code.length !== 6}
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Verify and log in
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={() => void sendOtp(identifier)}
            disabled={cooldown > 0 || busy}
            className="w-full text-center text-xs text-slate-400 hover:text-white disabled:opacity-50"
          >
            {cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Didn't get the OTP? Resend"}
          </button>
        </form>
      )}
    </div>
  );
}
