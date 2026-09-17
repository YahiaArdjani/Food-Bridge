import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Where each role is allowed to land inside /dashboard. */
const ROLE_HOME: Record<string, string> = {
  restaurant: "/dashboard/restaurant",
  charity: "/dashboard/charity",
};

type ProfileRow = { role: "restaurant" | "charity" | "admin" | null };

/**
 * Protects everything under `/dashboard/*`.
 *
 * 1. No authenticated session      -> redirect to /login (with a `next` hint)
 * 2. Session, but wrong role area  -> redirect to the role's own dashboard
 * 3. Session + correct area        -> continue
 *
 * The Supabase client is created here (and only here) with a `setAll` that
 * writes to the response, which is what keeps the auth session alive: the
 * route handlers below cannot write cookies from Server Components.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });

          // Keeps rotated auth responses out of CDN/proxy caches.
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        },
      },
    },
  );

  // Must be `getUser()` (it revalidates the JWT) and must run before any
  // response body is produced so refreshed cookies can be written back.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPath = request.nextUrl.pathname;

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?next=${encodeURIComponent(currentPath)}`;
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  // Fall back to the signup metadata while the profile trigger / row settles.
  const role =
    profile?.role ?? (user.user_metadata?.role as ProfileRow["role"]) ?? null;

  const home = role ? ROLE_HOME[role] : undefined;

  // `admin` (and any unknown role) keeps access to /dashboard itself.
  if (!home) {
    return response;
  }

  const alreadyInRoleArea =
    currentPath === home || currentPath.startsWith(`${home}/`);

  if (alreadyInRoleArea) {
    return response;
  }

  const roleUrl = request.nextUrl.clone();
  roleUrl.pathname = home;
  roleUrl.search = "";
  return NextResponse.redirect(roleUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
