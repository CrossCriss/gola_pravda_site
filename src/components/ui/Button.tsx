import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-dark hover:shadow-lg hover:shadow-accent/25 disabled:bg-ink/10 disabled:text-ink/30 disabled:hover:bg-ink/10 disabled:hover:shadow-none",
  secondary:
    "border-2 border-ink bg-transparent text-ink hover:bg-ink hover:text-white hover:shadow-md disabled:border-ink/15 disabled:text-ink/30 disabled:hover:bg-transparent disabled:hover:text-ink/30 disabled:hover:shadow-none",
  ghost:
    "bg-secondary/40 text-[oklch(0.35_0.1_300)] hover:bg-secondary/60 disabled:bg-ink/10 disabled:text-ink/30",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", className, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold transition duration-150 ease-out disabled:cursor-not-allowed",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  );
});
