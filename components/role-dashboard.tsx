import Link from "next/link";

import { BridgeMark } from "@/components/bridge-mark";
import { SignOutButton } from "@/components/sign-out-button";
import type { ProfileRecord } from "@/lib/supabase/queries";

export type DashboardRole = "restaurant" | "charity";

const COPY: Record<
  DashboardRole,
  { chip: string; heading: string; intro: string }
> = {
  restaurant: {
    chip: "Restaurant / hotel",
    heading: "Your kitchen dashboard",
    intro:
      "Publish the trays, bread and produce that will not be sold before closing. A charity nearby claims them and collects the same day.",
  },
  charity: {
    chip: "Charity",
    heading: "Your charity dashboard",
    intro:
      "See what kitchens around you have going spare right now, claim the pickups you can genuinely collect, and keep track of everything you have claimed.",
  },
};

/** Deliberately out of scope for this phase. */
const ROADMAP = ["Photos on listings", "Map + distance sorting", "Notifications"];

/**
 * The dashboard frame: brand header, page heading, whatever the role page
 * passes as children, then the account panel.
 *
 * Presentational on purpose — each route resolves its own session and data.
 */
export function RoleDashboard({
  role,
  email,
  profile,
  profileError,
  children,
}: {
  role: DashboardRole;
  email: string | undefined;
  profile: ProfileRecord | null;
  profileError?: string | null;
  children: React.ReactNode;
}) {
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
              {email}
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

        <div className="mt-10">{children}</div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="card-stamp">
            <span className="eyebrow">Your profile</span>
            <h2 className="mt-3 font-display text-2xl font-semibold">
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
                <dd className="truncate text-sm text-husk-900">{email}</dd>
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
            <span className="eyebrow">Phase 3 · what is live</span>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-husk-700">
              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-basil-600"
                />
                {role === "restaurant"
                  ? "Publish surplus with quantity, weight, expiry and pickup address"
                  : "Browse and claim surplus published around you"}
              </li>
              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-basil-600"
                />
                {role === "restaurant"
                  ? "Cancel a listing while it is still up for grabs"
                  : "See everything you have already claimed"}
              </li>
              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-basil-600"
                />
                {role === "restaurant"
                  ? "Your impact: kg rescued, plus estimated CO₂ avoided and meals"
                  : "The platform's impact totals on the public impact page"}
              </li>
            </ul>

            <p className="eyebrow mt-7 border-t-2 border-dashed border-husk-950/20 pt-5">
              Still to come
            </p>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-husk-600">
              {ROADMAP.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-500"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {profileError ? (
          <p
            role="status"
            className="mt-8 rounded-2xl border-2 border-ember-600/40 bg-ember-50 px-4 py-3 text-sm leading-relaxed text-ember-900"
          >
            {profileError}
          </p>
        ) : !profile ? (
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
        ) : null}
      </main>
    </div>
  );
}
