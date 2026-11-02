"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { adminLoginSchema } from "@/lib/validations";
import type { z } from "zod";

export function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<z.infer<typeof adminLoginSchema>>({ resolver: zodResolver(adminLoginSchema) });

  return (
    <form
      className="mx-auto mt-16 max-w-sm space-y-3 px-4"
      onSubmit={handleSubmit(async (v) => {
        setError(null);
        const res = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(v) });
        const data = await res.json().catch(() => null);
        if (!res.ok) return setError(data?.error || "Login failed");
        router.refresh();
      })}
    >
      <h1 className="text-2xl font-extrabold">Admin</h1>
      <div>
        <Label htmlFor="pw">Password</Label>
        <Input id="pw" type="password" autoComplete="current-password" {...register("password")} />
      </div>
      <FieldError>{error}</FieldError>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" aria-hidden />} Sign in
      </Button>
    </form>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.refresh();
      }}
    >
      <LogOut aria-hidden /> Sign out
    </Button>
  );
}

export function ModerationActions({ reportId, slug, status }: { reportId: string; slug: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const act = async (action: "disable" | "enable" | "delete" | "dismiss") => {
    if (action === "delete" && !confirm(`Delete quiz ${slug} permanently?`)) return;
    setBusy(action);
    await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reportId, slug, action }),
    });
    setBusy(null);
    router.refresh();
  };
  return (
    <div className="flex flex-wrap gap-2">
      {status === "active" ? (
        <Button size="sm" variant="secondary" disabled={!!busy} onClick={() => act("disable")}>
          {busy === "disable" && <Loader2 className="animate-spin" />} Disable
        </Button>
      ) : status === "disabled" ? (
        <Button size="sm" variant="secondary" disabled={!!busy} onClick={() => act("enable")}>
          Re-enable
        </Button>
      ) : null}
      {status !== "deleted" && (
        <Button size="sm" variant="danger" disabled={!!busy} onClick={() => act("delete")}>
          {busy === "delete" && <Loader2 className="animate-spin" />} Delete
        </Button>
      )}
      <Button size="sm" variant="ghost" disabled={!!busy} onClick={() => act("dismiss")}>
        Dismiss
      </Button>
    </div>
  );
}
