/**
 * Shared presentation helpers for scores. NOTE: actual scoring happens only in the database
 * (public.submit_attempt). Nothing here knows or computes correct answers.
 */

export type Tier = { min: number; title: string; emoji: string; line: string; confetti: boolean };

export const TIERS: Tier[] = [
  { min: 100, title: "Soulmate Level", emoji: "💞", line: "Perfect score! Kya tum dono ek hi insaan ho?", confetti: true },
  { min: 80, title: "Pakka Bestie", emoji: "🫶", line: "Tum dhyaan se sunte ho. Ise apne paas rakhna.", confetti: true },
  { min: 60, title: "Accha Dost", emoji: "😎", line: "Badhiya! Thodi aur hangout, aur tum top pe.", confetti: false },
  { min: 40, title: "Bas Jaan-Pehchaan", emoji: "🙂", line: "Basic baatein pata hain. Ab lambi baat ka time?", confetti: false },
  { min: 20, title: "Abhi Mile Ho Kya?", emoji: "😬", line: "Arre yaar! Bus stop pe mile the kya?", confetti: false },
  { min: 0, title: "Kaun ho bhai tum?", emoji: "🫠", line: "Ek ajnabi chat mein aa gaya hai.", confetti: false },
];

export function scorePct(score: number, total: number) {
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

export function tierFor(score: number, total: number): Tier {
  const pct = scorePct(score, total);
  return TIERS.find((t) => pct >= t.min) ?? TIERS[TIERS.length - 1];
}

/** Wordle-style grid, e.g. "🟩🟩🟥🟩🟥". Wraps every 5 for readability in chats. */
export function emojiGrid(correct: boolean[]) {
  const cells = correct.map((c) => (c ? "🟩" : "🟥"));
  const rows: string[] = [];
  for (let i = 0; i < cells.length; i += 5) rows.push(cells.slice(i, i + 5).join(""));
  return rows.join("\n");
}

export function percentileText(percentile: number | null | undefined, others: number) {
  if (percentile == null || others < 1) return "Tum pehle dost ho jisne khela! 🥇";
  if (percentile >= 100) return `Tumne ab tak sabko haraya (${others} ne khela) 🏆`;
  if (percentile <= 0) return `Baaki sabka score zyada hai... abhi tak 😅`;
  return `Tumne ${percentile}% doston ko haraya`;
}
