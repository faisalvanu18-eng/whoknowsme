/**
 * Lightweight abuse filter for user-generated text (nicknames, titles, custom questions/options).
 * It is a first line of defence, not a guarantee: the Report button + admin queue handle the rest.
 *
 * Checks:
 *  1. Profanity/slurs after normalising leetspeak, accents and repeated characters.
 *  2. Contact info / links (emails, phone numbers, URLs, @handles): we never want personal data
 *     in quizzes, and it is the most common spam vector.
 */

// Matched as whole words after normalisation.
const WORDS = [
  "fuck", "fucker", "fucking", "motherfucker", "shit", "bullshit", "bitch", "bastard", "cunt", "dick",
  "dickhead", "cock", "pussy", "asshole", "arsehole", "wanker", "twat", "prick", "slut", "whore",
  "hoe", "skank", "nigger", "nigga", "faggot", "fag", "retard", "retarded", "spastic", "tranny",
  "chink", "paki", "kike", "spic", "wetback", "gook", "dyke", "rape", "rapist", "porn", "porno",
  "nude", "nudes", "sex", "sexy", "boobs", "tits", "penis", "vagina", "dildo", "cum", "jizz",
  "nazi", "hitler", "kys", "suicide", "madarchod", "behenchod", "bhenchod", "chutiya", "chutiye",
  "gandu", "bhosdike", "bhosdi", "randi", "harami", "lauda", "lund", "kutta", "kamina",
];

// Matched anywhere inside the collapsed string (catches "f.u.c.k" and "fuuuck").
const SUBSTRINGS = ["fuck", "nigg", "faggot", "cunt", "motherf", "killyourself", "madarchod", "behenchod", "bhenchod"];

const LEET: Record<string, string> = {
  "0": "o", "1": "i", "!": "i", "|": "i", "3": "e", "4": "a", "@": "a", "5": "s", "$": "s", "7": "t", "+": "t", "8": "b", "9": "g",
};

function normalise(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[0-9!|@$+]/g, (c) => LEET[c] ?? c)
    .replace(/(.)\1{2,}/g, "$1$1");
}

const WORD_SET = new Set(WORDS);

export function containsProfanity(input: string): boolean {
  if (!input) return false;
  const norm = normalise(input);
  const words = norm.split(/[^a-z]+/).filter(Boolean);
  for (const w of words) {
    if (WORD_SET.has(w)) return true;
    // collapse doubled letters: "fuuck" -> "fuck"
    const single = w.replace(/(.)\1+/g, "$1");
    if (WORD_SET.has(single)) return true;
  }
  const lettersOnly = norm.replace(/[^a-z]/g, "");
  const deduped = lettersOnly.replace(/(.)\1+/g, "$1");
  // Raw letters catch "f.u.c.k"; the de-duplicated form catches "fuuuck", but only for terms that
  // contain no double letters themselves (de-duplicating "nigg" to "nig" would flag "night").
  return SUBSTRINGS.some((s) => lettersOnly.includes(s) || (!/(.)\1/.test(s) && deduped.includes(s)));
}

const EMAIL = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
const URL_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|in|co|me|ly|gg|xyz|app|link)\b)/i;
const PHONE = /(\+?\d[\d\s().-]{6,}\d)/;
const HANDLE = /(^|\s)@[a-z0-9_.]{3,}/i;

export function containsContactInfo(input: string): boolean {
  return EMAIL.test(input) || URL_RE.test(input) || PHONE.test(input) || HANDLE.test(input);
}

export function isCleanText(input: string): boolean {
  return !containsProfanity(input) && !containsContactInfo(input);
}
