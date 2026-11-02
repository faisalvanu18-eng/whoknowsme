"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flag, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError, Textarea } from "@/components/ui/input";
import { REPORT_REASONS, reportSchema, type ReportInput } from "@/lib/validations";
import { track } from "@/lib/analytics/events";

export function ReportButton({ slug, className }: { slug: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportInput>({ resolver: zodResolver(reportSchema), defaultValues: { slug, reason: "offensive", details: "" } });

  const onSubmit = async (v: ReportInput) => {
    setServerError(null);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(v),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok) return setServerError(data?.error || "Couldn't send. Please try again.");
    track("report_submitted", { slug, dim: v.reason });
    setDone(true);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className ?? "inline-flex min-h-11 items-center gap-1 px-1 font-semibold underline-offset-2 hover:underline"}>
        <Flag className="size-3.5" aria-hidden /> Report
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="report-title" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-t-3xl bg-card p-5 pb-safe sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 id="report-title" className="text-lg font-extrabold">
                Report this quiz
              </h2>
              <button type="button" onClick={() => setOpen(false)} className="inline-flex size-11 items-center justify-center rounded-full hover:bg-muted" aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            {done ? (
              <div className="py-6 text-center">
                <p className="text-3xl" aria-hidden>
                  🙏
                </p>
                <p className="mt-2 font-bold">Thanks. Our moderators will review it.</p>
                <p className="text-sm text-muted-foreground">Reports are anonymous.</p>
                <Button className="mt-5 w-full" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-2">
                <input type="hidden" {...register("slug")} />
                <fieldset className="space-y-2">
                  <legend className="mb-1 text-sm text-muted-foreground">What&apos;s wrong? Reports are anonymous.</legend>
                  {REPORT_REASONS.map((r) => (
                    <label key={r.value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                      <input type="radio" value={r.value} className="size-5 accent-[var(--primary)]" {...register("reason")} />
                      <span className="font-semibold">{r.label}</span>
                    </label>
                  ))}
                </fieldset>
                <Textarea placeholder="Anything else? (optional, don't include personal info)" maxLength={500} {...register("details")} />
                <FieldError>{errors.details?.message || errors.reason?.message || serverError}</FieldError>
                <Button type="submit" variant="danger" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="animate-spin" aria-hidden />} Send report
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
