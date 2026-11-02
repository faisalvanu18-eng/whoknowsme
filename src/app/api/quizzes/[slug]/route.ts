import { NextResponse } from "next/server";
import { getPublicQuiz } from "@/lib/quiz-data";

export const runtime = "nodejs";

/**
 * Public quiz payload (no correct answers). Cached at the CDN edge for 5 minutes and served
 * stale for up to a day while revalidating, so a viral quiz costs almost no database reads.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  let quiz;
  try {
    quiz = await getPublicQuiz(slug);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  if (!quiz) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404, headers: { "Cache-Control": "public, s-maxage=60" } },
    );
  }
  return NextResponse.json(
    { ok: true, quiz },
    {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
        "CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
        "X-Robots-Tag": "noindex",
      },
    },
  );
}
