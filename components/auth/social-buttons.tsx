"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="#EA4335"
        d="M12 10.2v3.96h5.49c-.24 1.43-1.69 4.2-5.49 4.2-3.3 0-6-2.73-6-6.1S8.7 6.16 12 6.16c1.88 0 3.14.8 3.86 1.49l2.63-2.54C16.86 3.6 14.66 2.6 12 2.6 6.92 2.6 2.8 6.7 2.8 11.78 2.8 16.86 6.92 21 12 21c6.94 0 9.34-4.86 9.34-9.34 0-.62-.07-1.1-.16-1.46H12z"
      />
    </svg>
  );
}

type SocialButtonsProps = {
  disabled?: boolean;
  callbackUrl?: string;
};

export function SocialButtons({
  disabled,
  callbackUrl = "/home",
}: SocialButtonsProps) {
  const [pending, setPending] = React.useState(false);

  const handleGoogle = async () => {
    try {
      setPending(true);
      await signIn("google", { callbackUrl });
    } catch (err) {
      toast.error("Google sign-in failed", {
        description: err instanceof Error ? err.message : "Try again.",
      });
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="glass"
        className="w-full"
        disabled={disabled || pending}
        onClick={handleGoogle}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="h-4 w-4" />
        )}
        Continue with Google
      </Button>
      <p className="text-center text-[11px] text-slate-400">
        We only read your name and email — never your contacts or Gmail.
      </p>
    </div>
  );
}
