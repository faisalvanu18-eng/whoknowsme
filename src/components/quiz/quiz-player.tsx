"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { ArrowLeft, Check, Loader2, Play, RotateCcw, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/misc";
import { Avatar } from "@/components/avatar";
import { MotionProvider } from "@/components/motion/motion-provider";
import { ReportButton } from "@/components/quiz/report-button";
import type { PublicQuiz } from "@/lib/quiz-data";
import { track } from "@/lib/analytics/events";
import { getPlayed, getRememberedRef, rememberRef, savePlayed, type PlayedQuiz } from "@/lib/local-store";
import { nicknameSchema } from "@/lib/validations";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type Phase = "intro" | "play" | "submitting" | "error";

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  const b = (globalThis.crypto as Crypto).getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function QuizPlayer({ quiz }: { quiz: PublicQuiz }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.questions.map(() => null));
  const [nickname, setNickname] = useState("");
  const [showName, setShowName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previous, setPrevious] = useState<PlayedQuiz | null>(null);
  const [dir, setDir] = useState(1);
  const idemKey = useRef<string | null>(null);
  const locked = useRef(false);

  useEffect(() => {
    const ref = new URLSearchParams(location.search).get("ref");
    rememberRef(ref);
    const prev = getPlayed().find((p) => p.slug === quiz.slug) ?? null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- device-local history after hydration
    setPrevious(prev);
    try {
      setNickname(localStorage.getItem("wk_friend_name") || "");
    } catch {
      /* ignore */
    }
    track("quiz_opened", { slug: quiz.slug });
  }, [quiz.slug]);

  const start = () => {
    if (nickname.trim()) {
      const r = nicknameSchema.safeParse(nickname);
      if (!r.success) {
        setShowName(true);
        setNameError(r.error.issues[0]?.message ?? "Try another nickname");
        return;
      }
      try {
        localStorage.setItem("wk_friend_name", r.data);
      } catch {
        /* ignore */
      }
    }
    haptic();
    idemKey.current = uuid();
    setAnswers(quiz.questions.map(() => null));
    setIndex(0);
    setDir(1);
    setPhase("play");
    track("quiz_started", { slug: quiz.slug });
    window.scrollTo({ top: 0 });
  };

  const submit = async (final: number[]) => {
    setPhase("submitting");
    setError(null);
    const ref = new URLSearchParams(location.search).get("ref") || getRememberedRef();
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: quiz.slug,
          answers: final,
          idempotencyKey: idemKey.current,
          nickname: nickname.trim() || undefined,
          ref: ref && /^[a-z0-9]{6,10}$/.test(ref) ? ref : undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Couldn't save your answers.");
      track("quiz_completed", { slug: quiz.slug, value: data.score, dim: `${data.score}/${data.total}` });
      savePlayed({
        resultId: data.attemptId,
        slug: quiz.slug,
        title: quiz.title,
        creator: quiz.nickname,
        score: data.score,
        total: data.total,
        playedAt: new Date().toISOString(),
      });
      haptic([20, 60, 20]);
      router.replace(`/result/${data.attemptId}?ref=${data.refCode}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPhase("error");
    }
  };

  const choose = (opt: number) => {
    if (locked.current) return;
    locked.current = true;
    haptic(10);
    const next = answers.map((a, i) => (i === index ? opt : a));
    setAnswers(next);
    track("question_answered", { slug: quiz.slug, dim: String(index + 1) });
    setTimeout(() => {
      locked.current = false;
      if (index < quiz.questions.length - 1) {
        setDir(1);
        setIndex(index + 1);
      } else {
        void submit(next as number[]);
      }
    }, 260);
  };

  if (phase === "intro") {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-lg flex-col px-4 pt-8">
        <div className="animate-fade-up flex flex-col items-center text-center">
          <Avatar id={quiz.avatar} size={104} className="animate-float shadow-xl shadow-primary/30" />
          <p className="mt-4 text-sm font-bold text-primary">{quiz.nickname} ne apne baare mein quiz banaya hai</p>
          <h1 className="mt-1 text-3xl font-extrabold leading-tight">{quiz.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {quiz.questions.length} chhote sawaal · lagbhag {Math.max(20, quiz.questions.length * 5)} second
          </p>
          {previous && (
            <p className="mt-4 rounded-full bg-muted px-4 py-2 text-sm font-semibold">
              You scored {previous.score}/{previous.total} last time.{" "}
              <Link href={`/result/${previous.resultId}`} className="text-primary underline">
                See result
              </Link>
            </p>
          )}
        </div>

        <div className="mt-8">
          {showName ? (
            <div className="animate-fade-up">
              <label htmlFor="friend-name" className="mb-1.5 block text-sm font-bold">
                Tumhara nickname <span className="font-normal text-muted-foreground">(zaroori nahi, sirf {quiz.nickname} dekhega)</span>
              </label>
              <Input
                id="friend-name"
                value={nickname}
                maxLength={24}
                autoComplete="nickname"
                placeholder="e.g. Alex"
                aria-invalid={!!nameError}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setNameError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && start()}
              />
              {nameError && <p className="mt-1 text-sm text-danger">{nameError}</p>}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowName(true)}
              className="mx-auto flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground"
            >
              <UserRound className="size-4" aria-hidden />
              {nickname ? `${nickname} ke naam se khel rahe ho · badlo` : `Naam daalo taaki ${quiz.nickname} ko pata chale tum ho`}
            </button>
          )}
        </div>

        <div className="sticky bottom-0 -mx-4 mt-auto bg-gradient-to-t from-background via-background to-background/0 px-4 pb-safe pt-6">
          <Button variant="gradient" size="hero" className="w-full" onClick={start} autoFocus>
            <Play className="fill-current" aria-hidden /> {previous ? "Dobara khelo" : "Shuru karo"}
          </Button>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Sign-up nahi. Jawab 7 din baad delete.</span>
            <ReportButton slug={quiz.slug} />
          </div>
        </div>
      </div>
    );
  }

  if (phase === "submitting" || phase === "error") {
    return (
      <div className="mx-auto flex min-h-[70dvh] max-w-lg flex-col items-center justify-center px-4 text-center" aria-live="polite">
        {phase === "submitting" ? (
          <>
            <Loader2 className="size-12 animate-spin text-primary" aria-hidden />
            <p className="mt-4 text-xl font-extrabold">Score nikal rahe hain…</p>
            <p className="text-muted-foreground">Dekhte hain tum {quiz.nickname} ko kitna jaante ho 👀</p>
          </>
        ) : (
          <>
            <p className="text-4xl" aria-hidden>
              😵
            </p>
            <p className="mt-3 text-xl font-extrabold">{error}</p>
            <div className="mt-6 grid w-full grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setPhase("play")}>
                <ArrowLeft aria-hidden /> Back
              </Button>
              <Button onClick={() => submit(answers as number[])}>
                <RotateCcw aria-hidden /> Phir se try karo
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  const q = quiz.questions[index];
  return (
    <MotionProvider>
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-lg flex-col px-4 pb-safe pt-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => {
              setDir(-1);
              setIndex(index - 1);
            }}
            className="inline-flex size-11 items-center justify-center rounded-full hover:bg-muted disabled:opacity-30"
            aria-label="Pichla sawaal"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs font-bold text-muted-foreground">
              <span>
                {index + 1} / {quiz.questions.length}
              </span>
              <span className="flex items-center gap-1">
                <Avatar id={quiz.avatar} size={18} /> {quiz.nickname}
              </span>
            </div>
            <Progress value={(index / quiz.questions.length) * 100} label="Quiz progress" />
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <m.div
            key={index}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mt-8 flex flex-1 flex-col"
          >
            <h1 className="text-2xl font-extrabold leading-snug">{q.text}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{quiz.nickname} kya choose karega?</p>
            <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Answers">
              {q.options.map((o, i) => {
                const selected = answers[index] === i;
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
          </m.div>
        </AnimatePresence>
      </div>
    </MotionProvider>
  );
}
