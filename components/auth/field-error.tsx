import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  message?: string;
  className?: string;
};

export function FieldError({ id, message, className }: Props) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className={cn("text-xs text-rose-300", className)}
    >
      {message}
    </p>
  );
}
