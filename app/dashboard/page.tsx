import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BridgeMark } from "@/components/bridge-mark";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Role router for the bare `/dashboard` path — the middleware sends
 * restaurants and charities straight to their own dashboard, so this mainly
 * serves admins (and anyone whose profile row has not been created yet).
 */
export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=session");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "restaurant") {
    redirect("/dashboard/restaurant");
  }

  if (profile?.role === "charity") {
    redirect("/dashboard/charity");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b-2 border-husk-950/10 bg-canvas/85 backdrop-blur-md">
        <div className="shell flex h-[68px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-basil-800">
            <BridgeMark className="h-9 w-9" />
            <span className="font-display text-lg font-semibold tracking-headline">
              Food&nbsp;Bridge
            </span>
          </Link>
          <SignOutButton />
        </div>
      </header>

      <main className="shell flex-1 py-16">
        <div className="card-stamp max-w-2xl">
          <span className="chip">Admin</span>
          <h1 className="mt-5 font-display text-3xl font-semibold">
            No role dashboard for this account yet
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-husk-700">
            You are signed in as{" "}
            <span className="font-medium text-husk-900">{user.email}</span>, but
            this account has no restaurant or charity profile. If you expected a
            dashboard here, check that{" "}
            <code className="font-mono text-xs">supabase/schema.sql</code> has
            been applied and that your profile row carries the right role.
          </p>
          <Link href="/" className="btn btn-outline mt-8 px-5 py-2">
            Back to the homepage
          </Link>
        </div>
      </main>
    </div>
  );
}
