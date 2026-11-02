import { clsx, type ClassValue } from "clsx";

/**
 * Class joiner. Deliberately clsx-only: tailwind-merge would add ~9KB gzipped to every page.
 * Rule for components: base classes and className must not set the same CSS property; use a
 * variant/prop for alternatives, and keep conditional branches mutually exclusive.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

export function formatRelative(iso: string, now = Date.now()) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/** Deterministic, seedable shuffle (mulberry32). Used for "fresh question set" remixing. */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  let a = seed >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
