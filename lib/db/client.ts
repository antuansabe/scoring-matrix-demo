import { createClient, SupabaseClient } from "@supabase/supabase-js";

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

let _client: SupabaseClient | null = null;

// Deferred until first use so the module can be imported in contexts where
// the Supabase env vars are not present (CI typecheck, test runners, etc.).
// Uses SUPABASE_SECRET_KEY (full privilege, server-only) — never import this
// module from a client component.
export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!url) throw new SupabaseConfigError("SUPABASE_URL is not set");
    if (!secretKey) throw new SupabaseConfigError("SUPABASE_SECRET_KEY is not set");
    _client = createClient(url, secretKey, {
      auth: { persistSession: false },
    });
  }
  return _client;
}
