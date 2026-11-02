import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-12 w-full rounded-xl border-2 border-border bg-card px-4 text-base text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:border-primary focus-visible:outline-none disabled:opacity-50 aria-[invalid=true]:border-danger",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-none aria-[invalid=true]:border-danger",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-bold", className)} {...props} />;
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm font-medium text-danger">
      {children}
    </p>
  );
}
