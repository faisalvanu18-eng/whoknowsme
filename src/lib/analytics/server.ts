import "server-only";
import { db, isSupabaseConfigured } from "@/lib/supabase/server";

/** Increment first-party aggregate counters (daily_stats). Never throws. */
export async function bumpStats(events: { m: string; d?: string; n?: number }[]) {
  if (!events.length || !isSupabaseConfigured()) return;
  try {
    const { error } = await db().rpc("bump_stats", { p_events: events });
    if (error) console.error("[stats] bump failed", error.message);
  } catch (err) {
    console.error("[stats] bump failed", err);
  }
}
