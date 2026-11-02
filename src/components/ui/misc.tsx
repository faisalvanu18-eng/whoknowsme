import * as React from "react";
import { cn } from "@/lib/utils";

const BADGE_TONES = {
  default: "bg-muted text-primary",
  danger: "bg-danger/15 text-danger",
} as const;

export function Badge({ className, tone = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof BADGE_TONES }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold", BADGE_TONES[tone], className)} {...props} />;
}

/** Defaults to rounded-xl unless the caller passes its own rounded-* class. */
export function Skeleton({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("skeleton", !/\brounded-/.test(className) && "rounded-xl", className)} {...props} />;
}

export function Progress({ value, className, label }: { value: number; className?: string; label?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-label={label}
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div className="h-full rounded-full bg-brand-gradient transition-[width] duration-300 ease-out" style={{ width: `${value}%` }} />
    </div>
  );
}

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-5xl px-4 sm:px-6", className)} {...props} />;
}
