import { cn } from "@/lib/utils";

type GradientTextProps = {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3";
};

export function GradientText({
  children,
  className,
  as: Tag = "span",
}: GradientTextProps) {
  return (
    <Tag className={cn("gradient-text-primary inline-block", className)}>
      {children}
    </Tag>
  );
}
