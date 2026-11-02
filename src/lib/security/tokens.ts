import "server-only";
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

const ALPHANUM = "abcdefghijkmnpqrstuvwxyz23456789"; // no 0/o/1/l to avoid confusion when read aloud

export function randomCode(length: number) {
  let s = "";
  for (let i = 0; i < length; i++) s += ALPHANUM[randomInt(ALPHANUM.length)];
  return s;
}

/** Public quiz slug: 8 chars from a 32-char alphabet = 40 bits. Not guessable at scale, short to share. */
export const newSlug = () => randomCode(8);
/** Anonymous referral code (?ref=). */
export const newRefCode = () => randomCode(7);

/** Creator secret: 32 random bytes, base64url (43 chars). Only the SHA-256 hash is stored. */
export function newCreatorToken() {
  return randomBytes(32).toString("base64url");
}

export function sha256Hex(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export function safeEqual(a: string, b: string) {
  const ab = Buffer.from(sha256Hex(a));
  const bb = Buffer.from(sha256Hex(b));
  return timingSafeEqual(ab, bb);
}

export function hmac(secret: string, data: string) {
  return createHmac("sha256", secret).update(data).digest("base64url");
}
