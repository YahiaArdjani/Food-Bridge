import Link from "next/link";
import { redirect } from "next/navigation";
import { BridgeMark } from "@/components/bridge-mark";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";

export type DashboardRole = "restaurant" | "charity";

const COPY: Record<
  DashboardRole,
  { chip: string; heading: string; intro: string; upcoming: string[] }
> = {
  restaurant: {
    chip: "Restaurant / hotel",
    heading: "Your kitchen dashboard",
    intro:
      "This is where you will publish what the kitchen could not sell. Nothing to publish yet — listings ship in the next phase.",
    upcoming: [
      "Publish tonight's surplus with quantity and pickup window",
      "See which charity claimed each listing",
      "Keep a log of meals handed over instead of binned",
    ],
  },
  charity: {
    chip: "Charity",
    heading: "Your charity dashboard",
    intro:
      "This is where nearby surplus will appear, ready to claim. Nothing listed yet — listings ship in the next phase.",
    upcoming: [
      "Browse surplus published by kitchens in your city",
      "Claim the pickups you can genuinely collect",
      "Track what you collected and what it became",
    ],
  },
};

export async function RoleDashboard({ role }: { role: DashboardRole }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, organization_name, phone, address, city, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const copy = COPY[role];
  const organisation = profile?.organization_name ?? "your organisation";

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
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-husk-600 sm:inline">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="shell flex-1 py-12">
        <span className="chip">{copy.chip}</span>
        <h1 className="mt-5 font-display text-4xl leading-tight font-semibold sm:text-5xl">
          {copy.heading}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-husk-700">
          {copy.intro}
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="card-stamp">
            <h2 className="font-display text-2xl font-semibold">
              {organisation}
            </h2>
            <p className="mt-1.5 text-sm text-husk-600">
              The profile the other side of the bridge can see.
            </p>

            <dl className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <div>
                <dt className="field-label">Organisation</dt>
                <dd className="text-sm text-husk-900">
                  {profile?.organization_name ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="field-label">Contact person</dt>
                <dd className="text-sm text-husk-900">
                  {profile?.full_name ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="field-label">Phone</dt>
                <dd className="text-sm text-husk-900">
                  {profile?.phone ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="field-label">Email</dt>
                <dd className="truncate text-sm text-husk-900">
                  {user.email}
                </dd>
              </div>
              <div>
                <dt className="field-label">Address</dt>
                <dd className="text-sm text-husk-900">
                  {profile?.address ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="field-label">City</dt>
                <dd className="text-sm text-husk-900">{profile?.city ?? "—"}</dd>
              </div>
              <div>
                <dt className="field-label">Account role</dt>
                <dd className="text-sm text-husk-900">
                  {profile?.role ?? role}
                </dd>
              </div>
              <div>
                <dt className="field-label">Member since</dt>
                <dd className="text-sm text-husk-900">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </dd>
              </div>
            </dl>

            <Link href="/" className="btn btn-outline mt-9 px-5 py-2">
              Back to the homepage
            </Link>
          </section>

          <section className="card">
            <span className="eyebrow">Next up · phase 2</span>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-husk-700">
              {copy.upcoming.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-500"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t-2 border-dashed border-husk-950/20 pt-5 text-xs leading-relaxed text-husk-500">
              Kept deliberately empty for now: no listings and no analytics until
              the next phase.
            </p>
          </section>
        </div>

        {!profile && (
          <p
            role="status"
            className="mt-8 rounded-2xl border-2 border-ember-600/40 bg-ember-50 px-4 py-3 text-sm leading-relaxed text-ember-900"
          >
            No row was found in{" "}
            <code className="font-mono text-xs">public.profiles</code> for this
            account yet. Apply{" "}
            <code className="font-mono text-xs">supabase/schema.sql</code> to the
            project — the account itself works, but the profile details stay
            empty until the table and its trigger exist.
          </p>
        )}
      </main>
    </div>
  );
}
