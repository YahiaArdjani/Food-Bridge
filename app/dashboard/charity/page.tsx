import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ListingCard, ListingNotice } from "@/components/listing-card";
import { RoleDashboard } from "@/components/role-dashboard";
import { ROLE_HOME } from "@/lib/listings";
import {
  getAvailableListings,
  getClaimedListings,
  getSessionProfile,
} from "@/lib/supabase/queries";

import { ClaimListingButton } from "./claim-listing-button";

export const metadata: Metadata = { title: "Charity dashboard" };

export default async function CharityDashboardPage() {
  const { user, profile, profileError } = await getSessionProfile();

  if (!user) {
    redirect("/login?error=session");
  }

  if (profile && profile.role !== "charity") {
    redirect(ROLE_HOME[profile.role] ?? "/dashboard");
  }

  const [available, mine] = await Promise.all([
    getAvailableListings(),
    getClaimedListings(user.id),
  ]);

  return (
    <RoleDashboard
      role="charity"
      email={user.email}
      profile={profile}
      profileError={profileError}
    >
      {/* ---------------------------------------------------------------- */}
      {/* Available now                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="eyebrow">Available now</span>
            <h2 className="mt-3 font-display text-3xl font-semibold">
              Surplus up for grabs
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-husk-600">
              Published by kitchens around you, newest first. Claiming is
              first-come first-served — the second claim on a listing fails on
              purpose.
            </p>
          </div>

          {available.listings.length > 0 ? (
            <span className="status-pill status-available">
              {available.listings.length}{" "}
              {available.listings.length === 1 ? "listing" : "listings"} open
            </span>
          ) : null}
        </div>

        <div className="mt-7">
          {available.error ? (
            <ListingNotice
              tone="warning"
              title="Surplus could not be loaded"
              body={available.error}
            />
          ) : available.listings.length === 0 ? (
            <ListingNotice
              title="No surplus listed right now"
              body="Nothing has been published yet. Kitchens usually post after the lunch and dinner services, so check back later this evening."
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {available.listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  showRestaurant
                  actions={
                    <ClaimListingButton
                      listingId={listing.id}
                      foodType={listing.food_type}
                    />
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Claimed by this charity                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="mt-16 border-t-2 border-dashed border-husk-950/20 pt-12">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="eyebrow">Your pickups</span>
            <h2 className="mt-3 font-display text-3xl font-semibold">
              Claimed by you
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-husk-600">
              Everything you have claimed, most recent first. Call the kitchen
              from the details on the card to arrange collection.
            </p>
          </div>

          {mine.listings.length > 0 ? (
            <span className="status-pill status-claimed">
              {mine.listings.length} claimed
            </span>
          ) : null}
        </div>

        <div className="mt-7">
          {mine.error ? (
            <ListingNotice
              tone="warning"
              title="Your claims could not be loaded"
              body={mine.error}
            />
          ) : mine.listings.length === 0 ? (
            <ListingNotice
              title="You have not claimed anything yet"
              body="When you claim a listing it moves here, with the kitchen's contact details so you can arrange the pickup."
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {mine.listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  showRestaurant
                  actions={
                    <span className="text-xs text-husk-600">
                      You claimed this — arrange the pickup with{" "}
                      {listing.restaurant?.organization_name ??
                        "the kitchen"}
                      {listing.restaurant?.phone
                        ? ` on ${listing.restaurant.phone}`
                        : ""}
                      .
                    </span>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <p className="mt-12 text-xs leading-relaxed text-husk-500">
        Phase 4 adds photos, maps and notifications.{" "}
        <Link href="/" className="link-underline">
          Back to the homepage
        </Link>
        .
      </p>
    </RoleDashboard>
  );
}
