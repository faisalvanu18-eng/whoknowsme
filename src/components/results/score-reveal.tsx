"use client";

import { useEffect, useState } from "react";

/** Big animated score (count-up) + confetti on high tiers. CSS + rAF only; confetti is lazy-loaded. */
export function ScoreReveal({ score, total, confetti }: { score: number; total: number; confetti: boolean }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || score === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- immediate final value without animation
      setShown(score);
    } else {
      const duration = 900;
      const t0 = performance.now();
      let raf = 0;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        setShown(Math.round(score * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      if (!confetti) return () => cancelAnimationFrame(raf);
      const timer = setTimeout(async () => {
        const fire = (await import("canvas-confetti")).default;
        const colors = ["#7047EB", "#3984F7", "#F472B6", "#FBBF24", "#FFFFFF"];
        fire({ particleCount: 110, spread: 80, origin: { y: 0.35 }, colors, disableForReducedMotion: true });
        setTimeout(() => fire({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.5 }, colors, disableForReducedMotion: true }), 250);
        setTimeout(() => fire({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.5 }, colors, disableForReducedMotion: true }), 400);
      }, duration - 150);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }
  }, [score, confetti]);

  return (
    <div className="animate-pop-in flex items-baseline justify-center font-extrabold tabular-nums" aria-label={`${score} out of ${total}`}>
      <span className="text-brand-gradient text-8xl leading-none">{shown}</span>
      <span className="text-4xl text-muted-foreground">/{total}</span>
    </div>
  );
}
