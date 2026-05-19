import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "./env";

export function createClient() {
  const { supabaseKey, supabaseUrl } = getSupabaseEnv();

  return createBrowserClient(supabaseUrl, supabaseKey);
}
