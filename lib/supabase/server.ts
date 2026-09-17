import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * Always create a **new** client per request — never hoist one into a module
 * level variable, or sessions will leak between users. `setAll` throws when
 * called from a Server Component (cookies are read-only there); that is
 * expected, because `middleware.ts` refreshes the session for every
 * `/dashboard/*` request and writes the rotated cookies back to the response.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component: the middleware already handles
            // refreshing the session cookies.
          }
        },
      },
    },
  );
}
