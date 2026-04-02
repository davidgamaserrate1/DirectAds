import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full border bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none transition-all duration-200 text-sm ${
          error
            ? "border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error)]"
            : "border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
        } ${className}`}
        style={{ padding: "12px 16px", borderRadius: "var(--radius-md)" }}
        {...props}
      />
      {error && (
        <span className="text-xs text-[var(--color-error)]">{error}</span>
      )}
    </div>
  ),
);

Input.displayName = "Input";
