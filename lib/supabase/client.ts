import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components ("use client").
 *
 * Reads the public project URL/anon key from the environment. Create a new
 * client wherever you need one — `createBrowserClient` is a singleton in the
 * browser, so calling it repeatedly is cheap and safe.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
