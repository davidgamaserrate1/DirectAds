import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`w-full px-3 py-2 rounded-lg border bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none transition-all duration-200 resize-y min-h-[100px] ${
          error
            ? "border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error)]"
            : "border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-[var(--color-error)]">{error}</span>
      )}
    </div>
  ),
);

Textarea.displayName = "Textarea";
