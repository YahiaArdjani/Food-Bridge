import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Target of the confirmation link that Supabase emails on signup.
 * Exchanges the one-time `code` for a real session, then hands the user to the
 * middleware-guarded dashboard (which resolves the role).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback`);
}
