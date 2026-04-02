interface BadgeProps {
  variant?: "default" | "success" | "error" | "info";
  children: React.ReactNode;
}

const variants = {
  default: "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border)]",
  success: "bg-emerald-100 text-emerald-700 [data-theme=dark]_&:bg-emerald-900/30 [data-theme=dark]_&:text-emerald-400",
  error: "bg-red-100 text-red-700",
  info: "bg-sky-100 text-sky-700",
};

export function Badge({ variant = "default", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
