"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type Mode = "system" | "light" | "dark";
const KEY = "wk_theme";

/** Runs before paint (inlined in <head>) so there is no theme flash. */
export const themeInitScript = `(function(){try{var m=localStorage.getItem('${KEY}')||'light';var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

function apply(mode: Mode) {
  const dark = mode === "dark" || (mode === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("light");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with localStorage after hydration
    setMode(((localStorage.getItem(KEY) as Mode) || "light") as Mode);
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (localStorage.getItem(KEY) === "system") apply("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const next: Record<Mode, Mode> = { system: "light", light: "dark", dark: "system" };
  const Icon = mode === "dark" ? Moon : mode === "light" ? Sun : Monitor;

  return (
    <button
      type="button"
      onClick={() => {
        const m = next[mode];
        setMode(m);
        try {
          localStorage.setItem(KEY, m);
        } catch {
          /* ignore */
        }
        apply(m);
      }}
      className="inline-flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
      aria-label={`Theme: ${mode}. Switch to ${next[mode]}`}
      title={`Theme: ${mode}`}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
