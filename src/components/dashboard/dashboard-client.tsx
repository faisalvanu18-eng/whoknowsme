"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2, Timer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareKit } from "@/components/results/share-kit";
import { getMyQuizzes, removeMyQuiz, saveMyQuiz } from "@/lib/local-store";
import { quizShareText, quizUrl } from "@/lib/share";
import { track } from "@/lib/analytics/events";

type Props = { token: string; slug: string; title: string; avatar: string; nickname: string; size: number; refCode: string; createdAt: string; attempts: number };

export function DashboardNudge({ slug, nickname, size, refCode, attempts }: Props) {
  const msg =
    attempts === 0
      ? "Nobody has played yet. Drop the link in your group chat to get the first scores in!"
      : attempts < 5
        ? `${attempts} ${attempts === 1 ? "friend" : "friends"} played. Share again to reach more 🚀`
        : `${attempts} friends played! Reshare and see if anyone can beat the top score 🏆`;
  const text = attempts > 0 ? `${attempts} people tried my quiz. Can you beat the top score? 😏\nHow well do you know ${nickname}?` : quizShareText(nickname, size);
  return (
    <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-4">
      <p className="font-extrabold">{msg}</p>
      <ShareKit className="mt-3" url={quizUrl(slug, refCode)} text={text} kind="quiz" slug={slug} storyImageUrl={`/api/story?quiz=${slug}`} compact />
    </div>
  );
}

export function RememberDevice(p: Props) {
  const [saved, setSaved] = useState(true);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const known = getMyQuizzes().some((q) => q.slug === p.slug);
    if (!known) saveMyQuiz({ slug: p.slug, token: p.token, title: p.title, avatar: p.avatar, createdAt: p.createdAt });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- device-local check after hydration
    setSaved(known);
    track("dashboard_opened", { slug: p.slug });
  }, [p.slug, p.token, p.title, p.avatar, p.createdAt]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(location.href.split("?")[0]);
      setCopied(true);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="rounded-2xl border-2 border-dashed p-4 text-sm">
      <p className="font-bold">🔑 This page is private. Anyone with this link can see results and delete the quiz.</p>
      <p className="mt-1 text-muted-foreground">
        {saved ? "Saved on this device under \"My quizzes\"." : "We just saved it on this device."} Bookmark it or copy it somewhere safe to open it elsewhere.
      </p>
      <Button variant="secondary" size="sm" className="mt-3" onClick={copy}>
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />} {copied ? "Copied" : "Copy private link"}
      </Button>
    </div>
  );
}

export function DangerZone({ token, slug, expiresAt }: { token: string; slug: string; expiresAt: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const act = async (action: "delete" | "set_expiry" | "clear_expiry") => {
    setBusy(action);
    setError(null);
    const res = await fetch("/api/dashboard", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, action }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(null);
    if (!res?.ok) return setError(data?.error || "Something went wrong.");
    if (action === "delete") {
      removeMyQuiz(slug);
      router.replace("/me?deleted=1");
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border-2 p-4">
      <h2 className="font-extrabold">Settings</h2>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm">
          <Timer className="mr-1 inline size-4" aria-hidden />
          {expiresAt
            ? // Fixed locale + time zone so the server render and the phone show the same text (no hydration error).
              `Auto-deletes on ${new Date(expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}`
            : "Stays until you delete it"}
        </p>
        <Button size="sm" variant="secondary" disabled={!!busy} onClick={() => act(expiresAt ? "clear_expiry" : "set_expiry")}>
          {busy === "set_expiry" || busy === "clear_expiry" ? <Loader2 className="animate-spin" aria-hidden /> : null}
          {expiresAt ? "Keep it" : "Delete in 30 days"}
        </Button>
      </div>
      {confirm ? (
        <div className="rounded-xl bg-danger/10 p-3">
          <p className="text-sm font-bold">Delete this quiz and all results? This can&apos;t be undone.</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button size="sm" variant="secondary" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" disabled={!!busy} onClick={() => act("delete")}>
              {busy === "delete" ? <Loader2 className="animate-spin" aria-hidden /> : <Trash2 aria-hidden />} Delete
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="dangerGhost" onClick={() => setConfirm(true)}>
          <Trash2 aria-hidden /> Delete quiz
        </Button>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
