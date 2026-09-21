import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ImpactStats } from "@/components/impact-stats";
import { ListingCard, ListingNotice } from "@/components/listing-card";
import { RoleDashboard } from "@/components/role-dashboard";
import { ROLE_HOME } from "@/lib/listings";
import {
  getOwnListings,
  getRestaurantImpact,
  getSessionProfile,
} from "@/lib/supabase/queries";

import { CancelListingButton } from "./cancel-listing-button";

export const metadata: Metadata = { title: "Restaurant dashboard" };

export default async function RestaurantDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string }>;
}) {
  const { user, profile, profileError } = await getSessionProfile();

  if (!user) {
    redirect("/login?error=session");
  }

  // Keep each role in its own area (the proxy does this too, belt and braces).
  if (profile && profile.role !== "restaurant") {
    redirect(ROLE_HOME[profile.role] ?? "/dashboard");
  }

  const [{ listings, error }, impact, params] = await Promise.all([
    getOwnListings(user.id),
    getRestaurantImpact(user.id),
    searchParams,
  ]);

  const available = listings.filter((item) => item.status === "available");
  const claimed = listings.filter((item) => item.status === "claimed");
  const closed = listings.filter(
    (item) => item.status === "cancelled" || item.status === "picked_up",
  );

  return (
    <RoleDashboard
      role="restaurant"
      email={user.email}
      profile={profile}
      profileError={profileError}
    >
      {params.published ? (
        <p
          role="status"
          className="mb-8 rounded-2xl border-2 border-basil-700/30 bg-basil-50 px-5 py-4 text-sm text-basil-900"
        >
          Listing published — charities nearby can see it now.
        </p>
      ) : null}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="eyebrow">Your listings</span>
            <h2 className="mt-3 font-display text-3xl font-semibold">
              What is left in the kitchen
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-husk-600">
              Everything you have published, newest first. Cancelling is only
              possible while a listing is still available.
            </p>
          </div>

          <Link
            href="/dashboard/restaurant/new"
            className="btn btn-primary px-5 py-2.5"
          >
            Publish surplus
          </Link>
        </div>

        {listings.length > 0 ? (
          <ul className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
            <li>
              <span className="status-pill status-available">
                {available.length}{" "}
                {available.length === 1 ? "listing" : "listings"} available
              </span>
            </li>
            <li>
              <span className="status-pill status-claimed">
                {claimed.length} claimed
              </span>
            </li>
            <li>
              <span className="status-pill status-picked-up">
                {closed.length} closed
              </span>
            </li>
          </ul>
        ) : null}

        <div className="mt-7">
          {error ? (
            <ListingNotice
              tone="warning"
              title="Listings could not be loaded"
              body={error}
            />
          ) : listings.length === 0 ? (
            <ListingNotice
              title="Nothing published yet"
              body="When the pass slows down, publish what is left with a quantity and a pickup deadline. Charities around you will see it straight away."
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  claimer={listing.claimer}
                  actions={
                    listing.status === "available" ? (
                      <CancelListingButton listingId={listing.id} />
                    ) : listing.status === "claimed" ? (
                      <span className="text-xs text-husk-600">
                        A charity has claimed this — cancellation is closed.
                      </span>
                    ) : null
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Phase 3 — the restaurant's own ESG figures                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="mt-16 border-t-2 border-dashed border-husk-950/20 pt-12">
        {impact.error ? (
          <ListingNotice
            tone="warning"
            title="Your impact could not be calculated"
            body={impact.error}
          />
        ) : (
          <ImpactStats
            eyebrow="Your impact"
            heading="What your surplus has already become"
            intro={`Everything a charity has claimed or collected from you so far — ${impact.impact.rescuedListingCount} ${
              impact.impact.rescuedListingCount === 1 ? "listing" : "listings"
            } in total. These are your own figures; the platform-wide numbers live on the public impact page.`}
            totalKg={impact.impact.totalKg}
            totalDetail="Summed from the weights you entered when publishing, across your claimed and picked-up listings."
            footnote={
              <>
                Curious how the rest of the network is doing?{" "}
                <Link
                  href="/impact"
                  className="link-underline-light"
                >
                  See the platform-wide impact
                </Link>
                .
              </>
            }
          />
        )}
      </section>
    </RoleDashboard>
  );
}
