import type { Metadata } from "next";
import Link from "next/link";

import { BridgeMark } from "@/components/bridge-mark";
import { ImpactStats } from "@/components/impact-stats";
import { getPlatformImpact } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Our impact",
  description:
    "How much surplus food has been rescued through Food Bridge so far, how many kitchens take part and how many charities have been served.",
};

/**
 * Public ESG dashboard — deliberately outside /dashboard, so it is reachable
 * without an account and is not touched by the proxy route guard.
 *
 * The numbers come from get_platform_impact(), a SECURITY DEFINER aggregate
 * function: an anonymous visitor can read the totals, but not a single listing
 * or profile behind them.
 */
export default async function ImpactPage() {
  const { impact, error } = await getPlatformImpact();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b-2 border-husk-950/10 bg-canvas/85 backdrop-blur-md">
        <div className="shell flex h-[68px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-basil-800">
            <BridgeMark className="h-9 w-9" />
            <span className="font-display text-lg font-semibold tracking-headline">
              Food&nbsp;Bridge
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-husk-800 md:flex">
            <Link
              className="transition hover:text-basil-800"
              href="/#how-it-works"
            >
              How it works
            </Link>
            <Link
              className="transition hover:text-basil-800"
              href="/#who-its-for"
            >
              Who it&apos;s for
            </Link>
            <Link className="text-basil-800" href="/impact">
              Our impact
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link href="/login" className="btn btn-outline px-5 py-2">
              Log in
            </Link>
            <Link
              href="/signup"
              className="btn btn-primary hidden px-5 py-2 sm:inline-flex"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="shell py-14 sm:py-20">
          <span className="chip">
            <span className="h-1.5 w-1.5 animate-simmer rounded-full bg-ember-500" />
            Public · no account needed
          </span>

          <h1 className="mt-7 max-w-3xl font-display text-[2.4rem] leading-[1.03] font-semibold sm:text-5xl">
            Trays that reached a table
            <br />
            instead of a bin bag.
          </h1>

          <p className="mt-6 max-w-2xl leading-relaxed text-husk-700">
            Every figure below is counted from real listings: the surplus
            kitchens published, the pickups charities claimed, and the weight
            those kitchens recorded. Nothing here is a projection.
          </p>

          <div className="mt-11">
            {!impact ? (
              <div
                role="status"
                className="rounded-tile border-2 border-ember-600/40 bg-ember-50 px-6 py-6 text-sm leading-relaxed text-ember-900 sm:px-8"
              >
                <p className="font-display text-lg font-semibold">
                  The impact totals cannot be shown yet
                </p>
                <p className="mt-2">
                  {error ??
                    "The platform totals could not be loaded right now. Try again in a moment."}
                </p>
              </div>
            ) : (
              <ImpactStats
                eyebrow="Platform impact"
                heading="Food rescued through Food Bridge so far"
                totalKg={impact.totalKg}
                totalDetail="Weight of the listings a charity has claimed or collected, as estimated by each kitchen."
                restaurantCount={impact.restaurantCount}
                charityCount={impact.charityCount}
                footnote={
                  impact.totalKg === 0 ? (
                    <>
                      Nothing has been rescued yet — the first claimed listing
                      will start these numbers moving.{" "}
                      <Link
                        href="/signup?role=restaurant"
                        className="link-underline-light"
                      >
                        Publish the first surplus
                      </Link>
                      .
                    </>
                  ) : (
                    <>
                      Numbers refresh on every visit.{" "}
                      <Link
                        href="/signup?role=restaurant"
                        className="link-underline-light"
                      >
                        Add your kitchen
                      </Link>{" "}
                      or{" "}
                      <Link
                        href="/signup?role=charity"
                        className="link-underline-light"
                      >
                        join as a charity
                      </Link>
                      .
                    </>
                  )
                }
              />
            )}
          </div>
        </section>

        <section className="shell grid gap-6 pb-16 lg:grid-cols-2">
          <article className="card">
            <span className="eyebrow">How it is counted</span>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-husk-700">
              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-basil-600"
                />
                Food rescued sums the estimated weight of the listings a charity
                has claimed or picked up. Listings still up for grabs, or
                cancelled, are left out.
              </li>
              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-basil-600"
                />
                Restaurants participating are kitchens with at least one
                listing; charities served are the ones that have claimed at
                least one.
              </li>
              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-600"
                />
                CO₂ avoided assumes 2.5 kg CO₂e saved per kilogram of rescued
                food, and meals assume 0.5 kg of food per meal. Both are
                averages, so read them as estimates rather than measurements.
              </li>
            </ul>
          </article>

          <article className="card-stamp flex flex-col">
            <span className="eyebrow">Take part</span>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              Your kitchen is a few listings away from its own numbers.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-husk-600">
              Publishing surplus is free, and every listing a charity claims
              adds to the total above. Kitchens get their own impact panel as
              soon as the first pickup is arranged.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup?role=restaurant"
                className="btn btn-primary px-5 py-2.5"
              >
                Sign up as a restaurant
              </Link>
              <Link
                href="/signup?role=charity"
                className="btn btn-accent px-5 py-2.5"
              >
                Sign up as a charity
              </Link>
            </div>
          </article>
        </section>
      </main>

      <footer className="border-t-2 border-husk-950/10 bg-husk-100/60">
        <div className="shell flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-basil-800">
            <BridgeMark className="h-8 w-8" />
            <div>
              <p className="font-display text-base font-semibold">Food Bridge</p>
              <p className="font-mono text-[10px] tracking-[0.16em] text-husk-600 uppercase">
                Phase 3 · surplus listings &amp; impact
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-husk-700">
            <Link className="transition hover:text-basil-800" href="/">
              Home
            </Link>
            <Link
              className="transition hover:text-basil-800"
              href="/#how-it-works"
            >
              How it works
            </Link>
            <Link className="text-basil-800" href="/impact">
              Our impact
            </Link>
            <Link className="transition hover:text-basil-800" href="/login">
              Log in
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
