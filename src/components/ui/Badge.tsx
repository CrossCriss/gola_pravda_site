import { cn } from "@/lib/utils";

export type BadgeVariant = "sale" | "new" | "bestseller" | "neutral";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  sale: "bg-sale text-white font-display",
  new: "bg-accent text-white font-display",
  bestseller: "bg-tertiary text-[oklch(0.3_0.05_95)] font-display",
  neutral: "bg-ink/5 text-ink-soft font-sans",
};

export function Badge({
  variant,
  className,
  children,
}: {
  variant: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
