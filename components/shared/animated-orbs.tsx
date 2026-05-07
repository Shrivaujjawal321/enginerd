import { cn } from "@/lib/utils";

type AnimatedOrbsProps = {
  className?: string;
  variant?: "default" | "auth";
};

export function AnimatedOrbs({
  className,
  variant = "default",
}: AnimatedOrbsProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      <div
        className="animate-orb-1 absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.55) 0%, rgba(139,92,246,0) 65%)",
          filter: "blur(120px)",
        }}
      />
      <div
        className="animate-orb-2 absolute top-1/3 -right-32 h-[480px] w-[480px] rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(circle, rgba(6,182,212,0.55) 0%, rgba(6,182,212,0) 65%)",
          filter: "blur(120px)",
        }}
      />
      <div
        className={cn(
          "animate-orb-3 absolute -bottom-40 left-1/4 h-[560px] w-[560px] rounded-full",
          variant === "auth" ? "opacity-25" : "opacity-20",
        )}
        style={{
          background:
            "radial-gradient(circle, rgba(236,72,153,0.5) 0%, rgba(236,72,153,0) 65%)",
          filter: "blur(140px)",
        }}
      />
    </div>
  );
}
