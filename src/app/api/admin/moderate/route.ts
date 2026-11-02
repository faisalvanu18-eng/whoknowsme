import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase/server";
import { moderateSchema } from "@/lib/validations";
import { isSameOrigin, jsonError, readJson } from "@/lib/security/request";
import { isAdmin } from "@/lib/security/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return jsonError(403, "forbidden");
  if (!(await isAdmin())) return jsonError(401, "unauthorized");

  let body: unknown;
  try {
    body = await readJson(req, 1_000);
  } catch {
    return jsonError(400, "Invalid request");
  }
  const parsed = moderateSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "Invalid request");
  const { reportId, action } = parsed.data;
  let slug = parsed.data.slug;

  if (!slug && reportId) {
    const { data } = await db().from("reports").select("quiz_slug").eq("id", reportId).maybeSingle();
    slug = data?.quiz_slug;
  }

  const now = new Date().toISOString();
  if (action === "dismiss") {
    if (!reportId) return jsonError(400, "reportId required");
    await db().from("reports").update({ status: "dismissed", resolved_at: now }).eq("id", reportId);
    return NextResponse.json({ ok: true });
  }
  if (!slug) return jsonError(400, "slug required");

  if (action === "delete") {
    await db().from("quizzes").delete().eq("slug", slug);
  } else {
    await db().from("quizzes").update({ status: action === "disable" ? "disabled" : "active" }).eq("slug", slug);
  }
  if (action !== "enable") {
    await db().from("reports").update({ status: "actioned", resolved_at: now }).eq("quiz_slug", slug).eq("status", "open");
  }
  revalidatePath(`/quiz/${slug}`);
  return NextResponse.json({ ok: true });
}
