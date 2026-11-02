"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check, ExternalLink, Loader2, Pencil, Plus, RefreshCw, Shuffle, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { Progress } from "@/components/ui/misc";
import { Avatar } from "@/components/avatar";
import { AvatarPicker } from "@/components/create/avatar-picker";
import { Turnstile, turnstileEnabled } from "@/components/create/turnstile";
import { ShareKit } from "@/components/results/share-kit";
import {
  PACKS,
  QUESTION_BANK,
  TEMPLATES,
  getTemplate,
  pickQuestions,
  type PackId,
  type Template,
} from "@/data/question-bank";
import { randomAvatarId, isAvatarId } from "@/data/avatars";
import { nicknameSchema, questionInputSchema, titleSchema } from "@/lib/validations";
import { track } from "@/lib/analytics/events";
import { getRememberedRef, saveMyQuiz } from "@/lib/local-store";
import { QUIZ_SHARE_LINES, quizShareText, quizUrl } from "@/lib/share";
import { haptic } from "@/lib/haptics";
import { cn, seededShuffle } from "@/lib/utils";

type Draft = { key: string; bankId?: string; text: string; options: string[]; correctIndex: number | null; category: string };
type Step = "pick" | "answer" | "profile" | "done";
type Published = { slug: string; token: string; refCode: string; quizUrl: string; dashboardUrl: string; nickname: string; size: number; title: string; avatar: string };

const profileSchema = z.object({
  nickname: nicknameSchema,
  title: titleSchema,
  expire30: z.boolean(),
});
type ProfileForm = z.infer<typeof profileSchema>;

/** Every question ends with an "Other" choice (a 5th option) so any answer can be picked. */
const OTHER = "Other";

function toDraft(q: (typeof QUESTION_BANK)[number]): Draft {
  return { key: q.id, bankId: q.id, text: q.text, options: [...q.options, OTHER], correctIndex: null, category: q.pack };
}

function readProfile(): { nickname: string; avatar: string } | null {
  try {
    const p = JSON.parse(localStorage.getItem("wk_profile") || "null");
    return p && typeof p.nickname === "string" ? p : null;
  } catch {
    return null;
  }
}

export function CreateFlow() {
  // Query params are read on the client (not useSearchParams) so the page stays fully static
  // and the template picker is server-rendered HTML: fast LCP, no CSR bailout.
  const [source, setSource] = useState<"direct" | "result" | "challenge" | "remix">("direct");
  const [challengeFor, setChallengeFor] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("pick");
  const [template, setTemplate] = useState<Template | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [index, setIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [avatar, setAvatar] = useState("fox-violet");
  const [published, setPublished] = useState<Published | null>(null);
  const [pack, setPack] = useState<string>("mixed");

  const start = useCallback(
    (t: Template, seed = Math.floor(Math.random() * 1e9)) => {
      const qs = pickQuestions(t.packs, t.size, (list) => seededShuffle(list, seed + list.length));
      setTemplate(t);
      setPack(t.packs.length === 1 ? t.packs[0] : t.id);
      setDrafts(qs.map(toDraft));
      setIndex(0);
      setStep("answer");
      haptic();
      track("quiz_create_started", { dim: t.id });
      window.scrollTo({ top: 0 });
    },
    [],
  );

  // Prefill from ?template= (Challenge back / Make your own version): straight to answering.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = readProfile();
    const src = params.get("source");
    /* eslint-disable react-hooks/set-state-in-effect -- restore URL + device-local state after hydration */
    setAvatar(p && isAvatarId(p.avatar) ? p.avatar : randomAvatarId());
    if (src === "result" || src === "challenge" || src === "remix") setSource(src);
    setChallengeFor(params.get("for")?.slice(0, 24) || null);
    /* eslint-enable react-hooks/set-state-in-effect */
    const t = getTemplate(params.get("template") || "");
    const seed = Number(params.get("seed")) || undefined;
    const packParam = PACKS.find((p) => p.id === params.get("pack"));
    if (t) start(t, seed);
    else if (packParam) {
      const size = Number(params.get("size")) === 5 ? 5 : 10;
      start({ id: `pack-${packParam.id}`, name: `${packParam.name} ${size}`, emoji: packParam.emoji, size, packs: [packParam.id], blurb: "" }, seed);
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answered = drafts.filter((d) => d.correctIndex !== null).length;

  const choose = (i: number) => {
    haptic(10);
    setDrafts((ds) => ds.map((d, j) => (j === index ? { ...d, correctIndex: i } : d)));
    setTimeout(() => {
      if (index < drafts.length - 1) setIndex(index + 1);
      else setStep("profile");
    }, 220);
  };

  const swap = () => {
    const current = drafts[index];
    const used = new Set(drafts.map((d) => d.bankId).filter(Boolean));
    const samePack = QUESTION_BANK.filter((q) => q.pack === (current.category as PackId) && !used.has(q.id));
    const pool = samePack.length ? samePack : QUESTION_BANK.filter((q) => !used.has(q.id));
    if (!pool.length) return;
    const next = pool[Math.floor(Math.random() * pool.length)];
    haptic();
    setDrafts((ds) => ds.map((d, j) => (j === index ? toDraft(next) : d)));
  };

  if (step === "pick") return <PickStep source={source} challengeFor={challengeFor} onStart={start} />;

  if (step === "answer") {
    const d = drafts[index];
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-lg flex-col px-4 pb-safe pt-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (index === 0 ? setStep("pick") : setIndex(index - 1))}
            className="inline-flex size-11 items-center justify-center rounded-full hover:bg-muted"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs font-bold text-muted-foreground">
              <span>
                Question {index + 1} of {drafts.length}
              </span>
              <span>{template?.name}</span>
            </div>
            <Progress value={((index + (d?.correctIndex !== null ? 1 : 0)) / drafts.length) * 100} label="Quiz creation progress" />
          </div>
        </div>

        {editing ? (
          <CustomEditor
            initial={d}
            onCancel={() => setEditing(false)}
            onSave={(q) => {
              setDrafts((ds) => ds.map((x, j) => (j === index ? q : x)));
              setEditing(false);
              setTimeout(() => {
                if (index < drafts.length - 1) setIndex(index + 1);
                else setStep("profile");
              }, 150);
            }}
          />
        ) : (
          <div key={d.key} className="animate-fade-up mt-6 flex flex-1 flex-col">
            <p className="text-sm font-bold text-primary">Apna jawab tap karo 👇</p>
            <h1 className="mt-2 text-2xl font-extrabold leading-snug">{d.text}</h1>
            <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Your answer">
              {d.options.map((o, i) => {
                const selected = d.correctIndex === i;
                return (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => choose(i)}
                    className={cn(
                      "flex min-h-14 items-center justify-between gap-3 rounded-2xl border-2 px-5 py-3 text-left text-lg font-bold transition-[transform,border-color,background-color] active:scale-[0.98]",
                      selected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50",
                    )}
                  >
                    <span>{o}</span>
                    {selected && <Check className="size-6 shrink-0 text-primary" aria-hidden />}
                  </button>
                );
              })}
            </div>
            <div className="mt-auto grid grid-cols-2 gap-2 pt-8">
              <Button variant="ghost" onClick={swap}>
                <Shuffle aria-hidden /> Sawaal badlo
              </Button>
              <Button variant="ghost" onClick={() => setEditing(true)}>
                <Pencil aria-hidden /> Khud likho
              </Button>
            </div>
            {answered === drafts.length && (
              <Button size="lg" className="mt-3 w-full" onClick={() => setStep("profile")}>
                Aage badho
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (step === "profile") {
    return (
      <ProfileStep
        drafts={drafts}
        avatar={avatar}
        setAvatar={setAvatar}
        pack={pack}
        source={source}
        onEdit={(i) => {
          setIndex(i);
          setStep("answer");
        }}
        onPublished={(p) => {
          setPublished(p);
          setStep("done");
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  return published ? <DoneStep p={published} /> : null;
}

/* ------------------------------------------------------------------------------------------ */

function PickStep({ source, challengeFor, onStart }: { source: string; challengeFor: string | null; onStart: (t: Template) => void }) {
  const [size, setSize] = useState<5 | 10 | 15>(10);
  const [packs, setPacks] = useState<PackId[]>(["best-friends"]);
  const toggle = (p: PackId) => setPacks((cur) => (cur.includes(p) ? (cur.length > 1 ? cur.filter((x) => x !== p) : cur) : [...cur, p]));

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-6">
      {source !== "direct" ? (
        <div className="animate-pop-in rounded-2xl bg-brand-gradient p-5 text-white">
          <p className="text-sm font-bold opacity-90">Ab tumhari baari 😏</p>
          <h1 className="mt-1 text-2xl font-extrabold">
            {challengeFor ? `Apna quiz banao aur ${challengeFor} ko wapas bhejo` : "Apna quiz banao. Dekho tumhe kaun jaanta hai."}
          </h1>
          <p className="mt-1 text-sm opacity-90">Set chuno, apne jawab tap karo, 30 second mein ho gaya.</p>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-extrabold tracking-tight">Apna quiz banao</h1>
          <p className="mt-1 text-muted-foreground">Pehle ek set chuno, phir apne jawab tap karo. Bas 30 second lagenge.</p>
        </>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {TEMPLATES.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onStart(t)}
            className={cn(
              "group flex min-h-20 items-center gap-4 rounded-2xl border-2 bg-card p-4 text-left transition-[transform,border-color] hover:border-primary active:scale-[0.98]",
              i === 0 && "border-primary/70 sm:col-span-2",
            )}
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl" aria-hidden>
              {t.emoji}
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-2 font-extrabold">
                {t.name}
                {i === 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white">Most popular</span>}
              </span>
              <span className="block text-sm text-muted-foreground">{t.blurb}</span>
            </span>
          </button>
        ))}
      </div>

      <details className="mt-6 rounded-2xl border-2 bg-card p-4 open:pb-5">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-extrabold">
          <Sparkles className="size-5 text-primary" aria-hidden /> Build my own mix
        </summary>
        <div className="mt-3">
          <Label>How many questions?</Label>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Quiz size">
            {([5, 10, 15] as const).map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={size === s}
                onClick={() => setSize(s)}
                className={cn("h-12 rounded-xl border-2 font-bold", size === s ? "border-primary bg-primary/10 text-primary" : "border-border")}
              >
                {s}
              </button>
            ))}
          </div>
          <Label className="mt-4">Themes</Label>
          <div className="flex flex-wrap gap-2">
            {PACKS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={packs.includes(p.id)}
                onClick={() => toggle(p.id)}
                className={cn(
                  "min-h-11 rounded-full border-2 px-4 text-sm font-bold",
                  packs.includes(p.id) ? "border-primary bg-primary/10 text-primary" : "border-border",
                )}
              >
                {p.emoji} {p.name}
              </button>
            ))}
          </div>
          <Button
            className="mt-5 w-full"
            size="lg"
            onClick={() => onStart({ id: "custom", name: "My mix", emoji: "✨", size, packs, blurb: "" })}
          >
            Start answering
          </Button>
        </div>
      </details>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ */

function CustomEditor({ initial, onSave, onCancel }: { initial: Draft; onSave: (d: Draft) => void; onCancel: () => void }) {
  const isCustom = !initial.bankId;
  const [text, setText] = useState(isCustom ? initial.text : "");
  // "Other" is added automatically on save, so it is not shown as an editable answer here.
  const ownOptions = isCustom ? initial.options.filter((o) => o !== OTHER) : [];
  const [options, setOptions] = useState<string[]>(isCustom ? ownOptions : ["", "", ""]);
  const [correct, setCorrect] = useState<number | null>(isCustom && initial.correctIndex !== null && initial.correctIndex < ownOptions.length ? initial.correctIndex : null);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const opts = options.map((o) => o.trim()).filter(Boolean);
    const idx = correct === null ? -1 : options.slice(0, correct + 1).map((o) => o.trim()).filter(Boolean).length - 1;
    const parsed = questionInputSchema.safeParse({ text, options: opts, correctIndex: Math.max(idx, 0), category: "custom" });
    if (correct === null || idx < 0 || !options[correct]?.trim()) return setError("Tap the circle next to YOUR answer");
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Check your question");
    const finalOptions = parsed.data.options.some((o) => o.toLowerCase() === OTHER.toLowerCase()) ? parsed.data.options : [...parsed.data.options, OTHER];
    onSave({ key: `custom-${Date.now()}`, text: parsed.data.text, options: finalOptions, correctIndex: parsed.data.correctIndex, category: "custom" });
  };

  return (
    <div className="animate-fade-up mt-6">
      <h1 className="text-xl font-extrabold">Apna sawaal likho</h1>
      <p className="text-sm text-muted-foreground">Keep it about you: tastes, habits, opinions. No private info.</p>
      <Label htmlFor="cq" className="mt-4">
        Question
      </Label>
      <Input id="cq" value={text} maxLength={120} placeholder="What do I always order at our usual place?" onChange={(e) => setText(e.target.value)} />
      <Label className="mt-4">Options (apne jawab ke circle pe tap karo)</Label>
      <div className="space-y-2">
        {options.map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              type="button"
              aria-label={`Mark answer ${i + 1} as mine`}
              aria-pressed={correct === i}
              onClick={() => setCorrect(i)}
              className={cn("flex size-11 shrink-0 items-center justify-center rounded-full border-2", correct === i ? "border-primary bg-primary text-white" : "border-border")}
            >
              {correct === i && <Check className="size-5" />}
            </button>
            <Input
              value={o}
              maxLength={40}
              placeholder={`Answer ${i + 1}`}
              onChange={(e) => setOptions((cur) => cur.map((x, j) => (j === i ? e.target.value : x)))}
            />
            {options.length > 2 && (
              <button
                type="button"
                aria-label="Remove answer"
                onClick={() => {
                  setOptions((cur) => cur.filter((_, j) => j !== i));
                  setCorrect((c) => (c === i ? null : c !== null && c > i ? c - 1 : c));
                }}
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <Trash2 className="size-5" />
              </button>
            )}
          </div>
        ))}
      </div>
      {options.length < 4 && (
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => setOptions((c) => [...c, ""])}>
          <Plus aria-hidden /> Add answer
        </Button>
      )}
      <FieldError>{error}</FieldError>
      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={save}>Save question</Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ */

function ProfileStep({
  drafts,
  avatar,
  setAvatar,
  pack,
  source,
  onEdit,
  onPublished,
}: {
  drafts: Draft[];
  avatar: string;
  setAvatar: (a: string) => void;
  pack: string;
  source: string;
  onEdit: (i: number) => void;
  onPublished: (p: Published) => void;
}) {
  const saved = useMemo(() => readProfile(), []);
  const [titleTouched, setTitleTouched] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: saved?.nickname ?? "",
      title: saved?.nickname ? `${saved.nickname} ko kitna jaante ho?` : "",
      expire30: false,
    },
    mode: "onTouched",
  });

  const nickname = useWatch({ control, name: "nickname" });
  useEffect(() => {
    if (!titleTouched) setValue("title", nickname?.trim() ? `${nickname.trim()} ko kitna jaante ho?` : "", { shouldValidate: false });
  }, [nickname, titleTouched, setValue]);

  const missing = drafts.findIndex((d) => d.correctIndex === null);

  const onSubmit = async (v: ProfileForm) => {
    setServerError(null);
    if (missing >= 0) return onEdit(missing);
    if (turnstileEnabled && !token) {
      setServerError("Just a sec, checking you're human… tap Publish again in a moment.");
      return;
    }
    const ref = new URLSearchParams(window.location.search).get("ref") || getRememberedRef();
    const res = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: v.title,
        nickname: v.nickname,
        avatar,
        pack,
        size: drafts.length,
        questions: drafts.map((d) => ({ text: d.text, options: d.options, correctIndex: d.correctIndex, category: d.category, bankId: d.bankId })),
        expire30: v.expire30,
        source,
        ref: ref && /^[a-z0-9]{6,10}$/.test(ref) ? ref : undefined,
        turnstileToken: token ?? undefined,
      }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as (Published & { ok: boolean; error?: string }) | null;
    if (!res || !res.ok || !data?.ok) {
      setServerError(data?.error || "Network hiccup. Check your connection and try again.");
      setToken(null);
      setTurnstileReset((n) => n + 1);
      return;
    }
    try {
      localStorage.setItem("wk_profile", JSON.stringify({ nickname: v.nickname, avatar }));
    } catch {
      /* ignore */
    }
    saveMyQuiz({ slug: data.slug, token: data.token, title: v.title, avatar, createdAt: new Date().toISOString() });
    track("quiz_published", { dim: String(drafts.length), slug: data.slug });
    haptic([15, 40, 15]);
    onPublished({ ...data, nickname: v.nickname, size: drafts.length, title: v.title, avatar });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-lg flex-col px-4 pt-6" noValidate>
      <h1 className="text-2xl font-extrabold">Aakhri step: tum kaun ho?</h1>
      <p className="text-sm text-muted-foreground">Dost quiz kholte hi ye dekhenge. Nickname kaafi hai.</p>

      <div className="mt-5 flex justify-center">
        <Avatar id={avatar} size={88} className="animate-pop-in" />
      </div>
      <div className="mt-4">
        <AvatarPicker value={avatar} onChange={setAvatar} />
      </div>

      <div className="mt-6">
        <Label htmlFor="nickname">Tumhara nickname</Label>
        <Input id="nickname" autoComplete="nickname" maxLength={24} placeholder="e.g. Sam" aria-invalid={!!errors.nickname} {...register("nickname")} />
        <FieldError>{errors.nickname?.message}</FieldError>
      </div>
      <div className="mt-4">
        <Label htmlFor="title">Quiz ka title</Label>
        <Input
          id="title"
          maxLength={80}
          aria-invalid={!!errors.title}
          {...register("title", { onChange: () => setTitleTouched(true) })}
        />
        <FieldError>{errors.title?.message}</FieldError>
      </div>
      <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-muted/60 px-4 py-3 text-sm">
        <input type="checkbox" className="size-5 accent-[var(--primary)]" {...register("expire30")} />
        <span>
          <span className="font-bold">30 din baad mera quiz apne aap delete karo</span>
          <span className="block text-muted-foreground">Otherwise it stays until you delete it. Friends&apos; answers always vanish after 7 days.</span>
        </span>
      </label>

      <details className="mt-4 rounded-xl border-2 p-3 text-sm">
        <summary className="flex min-h-11 cursor-pointer items-center font-bold">Mere {drafts.length} jawab dekho</summary>
        <ol className="mt-2 space-y-1">
          {drafts.map((d, i) => (
            <li key={d.key}>
              <button type="button" onClick={() => onEdit(i)} className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-2 text-left hover:bg-muted">
                <span className="line-clamp-1">
                  {i + 1}. {d.text}
                </span>
                <span className={cn("shrink-0 font-bold", d.correctIndex === null ? "text-danger" : "text-primary")}>
                  {d.correctIndex === null ? "Answer" : d.options[d.correctIndex]}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </details>

      <div className="mt-4">
        <Turnstile onToken={setToken} resetKey={turnstileReset} />
      </div>
      <FieldError>{serverError}</FieldError>

      <div className="sticky bottom-0 -mx-4 mt-auto bg-gradient-to-t from-background via-background to-background/0 px-4 pb-safe pt-6">
        <Button type="submit" variant="gradient" size="xl" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" aria-hidden /> : <Sparkles aria-hidden />}
          {isSubmitting ? "Publish ho raha hai…" : "Publish karo aur link lo"}
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          By publishing you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>
          . Ages 13+.
        </p>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------------------------------ */

function DoneStep({ p }: { p: Published }) {
  const [line, setLine] = useState(0);
  const [copied, setCopied] = useState(false);
  const shareUrl = quizUrl(p.slug, p.refCode);

  const copyDashboard = async () => {
    try {
      await navigator.clipboard.writeText(p.dashboardUrl);
      setCopied(true);
      haptic();
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 pb-16 pt-6">
      <div className="animate-pop-in text-center">
        <Avatar id={p.avatar} size={84} className="mx-auto" />
        <h1 className="mt-3 text-3xl font-extrabold">Tumhara quiz live hai! 🎉</h1>
        <p className="mt-1 text-muted-foreground">Ab dosto ko bhejo. Jitne zyada khelenge, leaderboard utna mazedaar.</p>
      </div>

      <div className="mt-6 rounded-2xl border-2 bg-card p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="whitespace-pre-line text-sm font-semibold">{quizShareText(p.nickname, p.size, line)}</p>
          <button
            type="button"
            onClick={() => setLine((l) => (l + 1) % QUIZ_SHARE_LINES.length)}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-muted"
            aria-label="Try a different message"
            title="Try a different message"
          >
            <RefreshCw className="size-5" />
          </button>
        </div>
        <p className="mt-1 truncate text-sm text-primary">{shareUrl}</p>
      </div>

      <ShareKit
        className="mt-4"
        url={shareUrl}
        text={quizShareText(p.nickname, p.size, line)}
        kind="quiz"
        slug={p.slug}
        storyImageUrl={`/api/story?quiz=${p.slug}`}
      />

      <div className="mt-8 rounded-2xl border-2 border-dashed border-primary bg-primary/5 p-4">
        <p className="font-extrabold">🔑 Apna private results link save karo</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No accounts here, so this link is the only key to your leaderboard. We remembered it on this device, but save it somewhere safe (notes, or message it to yourself).
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={copyDashboard}>
            {copied ? <Check aria-hidden /> : null} {copied ? "Copied" : "Copy link"}
          </Button>
          <Link href={`/dashboard/${p.token}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary font-bold text-white">
            Results kholo <ExternalLink className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      <Link href={`/quiz/${p.slug}`} className="mt-6 block min-h-11 text-center text-sm font-semibold text-muted-foreground underline">
        Mera quiz dekho
      </Link>
    </div>
  );
}
