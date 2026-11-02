import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Server-only (the "server-only" import makes the build fail if a
 * client component ever imports this). RLS denies everything to anon, so this is the only way in.
 *
 * supabase-js uses PostgREST over HTTPS: connections are pooled by Supabase, so serverless
 * functions never open raw Postgres connections.
 */
let client: SupabaseClient | null = null;

// Accepts both Supabase naming schemes: the new secret key (sb_secret_...) or the legacy
// service_role JWT. The publishable/anon key is deliberately NOT used: anon has no table access.
const url = () => process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = () => process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(url() && secretKey());
}

export function db(): SupabaseClient {
  if (client) return client;
  const u = url();
  const key = secretKey();
  if (!u || !key) throw new Error("Supabase is not configured (SUPABASE_URL + SUPABASE_SECRET_KEY)");
  if (key.startsWith("sb_publishable_")) throw new Error("SUPABASE_SECRET_KEY is a publishable key; use the secret key");
  client = createClient(u, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { "x-application-name": "who-knows-you-better" } },
    db: { schema: "public" },
  });
  return client;
}
