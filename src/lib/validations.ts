import { z } from "zod";
import { isAvatarId } from "@/data/avatars";
import { isCleanText } from "@/lib/security/profanity";

// Zod's JIT uses `new Function`, which our CSP blocks in the browser (no 'unsafe-eval').
// Jitless mode keeps validation identical without eval, so the CSP stays strict.
z.config({ jitless: true });

const CLEAN_MSG = "Let's keep it friendly. Please remove rude words, links or contact details.";

const cleanString = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} is too short`)
    .max(max, `${label} is too long (max ${max})`)
    .refine((v) => isCleanText(v), CLEAN_MSG);

export const nicknameSchema = cleanString(1, 24, "Nickname").refine(
  (v) => /^[\p{L}\p{N}\p{M}\p{Extended_Pictographic}\u200d _.'\-]+$/u.test(v),
  "Use letters, numbers, spaces or emoji only",
);

export const titleSchema = cleanString(3, 80, "Title");

export const refCodeSchema = z.string().regex(/^[a-z0-9]{6,10}$/);
export const slugSchema = z.string().regex(/^[a-z0-9]{8,12}$/);
/** 32 random bytes, base64url encoded = 43 chars */
export const dashboardTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);

export const questionInputSchema = z
  .object({
    text: cleanString(3, 120, "Question"),
    options: z.array(cleanString(1, 40, "Answer")).min(2, "Add at least 2 answers").max(5, "Max 5 answers"),
    correctIndex: z.number().int().min(0).max(4),
    category: z.string().trim().max(32).regex(/^[a-z-]*$/).default("custom"),
    bankId: z.string().max(40).regex(/^[a-z]+-\d{2}$/).optional(),
  })
  .refine((q) => q.correctIndex < q.options.length, { message: "Pick your answer", path: ["correctIndex"] })
  .refine((q) => new Set(q.options.map((o) => o.toLowerCase())).size === q.options.length, {
    message: "Answers must be different",
    path: ["options"],
  });
export type QuestionInput = z.infer<typeof questionInputSchema>;

export const createQuizSchema = z
  .object({
    title: titleSchema,
    nickname: nicknameSchema,
    avatar: z.string().refine(isAvatarId, "Pick an avatar"),
    pack: z.string().trim().max(32).regex(/^[a-z0-9-]+$/).default("mixed"),
    size: z.union([z.literal(5), z.literal(10), z.literal(15)]),
    questions: z.array(questionInputSchema).min(5).max(15),
    expire30: z.boolean().default(false),
    source: z.enum(["direct", "result", "challenge", "remix"]).default("direct"),
    ref: refCodeSchema.optional(),
    turnstileToken: z.string().max(2048).optional(),
  })
  .refine((v) => v.questions.length === v.size, { message: "Answer every question", path: ["questions"] });
export type CreateQuizInput = z.infer<typeof createQuizSchema>;

export const submitAttemptSchema = z.object({
  slug: slugSchema,
  answers: z.array(z.number().int().min(0).max(4)).min(5).max(15),
  idempotencyKey: z.uuid(),
  nickname: nicknameSchema.optional().or(z.literal("").transform(() => undefined)),
  ref: refCodeSchema.optional(),
});
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;

export const REPORT_REASONS = [
  { value: "offensive", label: "Offensive or hateful" },
  { value: "harassment", label: "Bullying or harassment" },
  { value: "personal_info", label: "Shares personal information" },
  { value: "sexual", label: "Sexual content" },
  { value: "spam", label: "Spam or scam" },
  { value: "other", label: "Something else" },
] as const;

export const reportSchema = z.object({
  slug: slugSchema,
  reason: z.enum(["offensive", "harassment", "personal_info", "spam", "sexual", "other"]),
  details: z.string().trim().max(500).optional(),
});
export type ReportInput = z.infer<typeof reportSchema>;

export const SHARE_CHANNELS = ["whatsapp", "instagram", "telegram", "copy", "qr", "native", "x", "messenger", "other"] as const;
export type ShareChannel = (typeof SHARE_CHANNELS)[number];

/** Events the first-party counter endpoint accepts. Everything else is GA-only. */
export const TRACKABLE_EVENTS = [
  "visit",
  "quiz_create_started",
  "quiz_opened",
  "quiz_started",
  "share_clicked",
  "result_shared",
  "ad_slot_viewed",
  "dashboard_opened",
  "daily_question_answered",
] as const;

export const trackSchema = z.object({
  event: z.enum(TRACKABLE_EVENTS),
  channel: z.enum(SHARE_CHANNELS).optional(),
  slug: slugSchema.optional(),
  dim: z.string().max(40).regex(/^[a-z0-9_-]*$/).optional(),
});

export const dashboardActionSchema = z.object({
  token: dashboardTokenSchema,
  action: z.enum(["delete", "set_expiry", "clear_expiry"]),
});

export const adminLoginSchema = z.object({ password: z.string().min(1).max(256) });

export const moderateSchema = z.object({
  reportId: z.uuid().optional(),
  slug: slugSchema.optional(),
  action: z.enum(["disable", "enable", "delete", "dismiss"]),
});
