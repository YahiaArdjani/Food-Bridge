/**
 * Server-only data access for the dashboards.
 *
 * Every function returns `error` instead of throwing, so a missing migration or
 * an expired session shows a readable notice in the UI rather than a 500.
 */
import { platformImpactFromRow, restaurantImpactFromRows } from "@/lib/impact";
import type { ListingRow, ProfileSummary } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";

export type ProfileRecord = ProfileSummary & {
  id: string;
  role: "restaurant" | "charity" | "admin";
  created_at: string;
};

const PROFILE_COLUMNS =
  "id, role, full_name, organization_name, phone, address, city, created_at";

const LISTING_COLUMNS =
  "id, restaurant_id, food_type, quantity, expiry_at, pickup_address, status, claimed_by, claimed_at, created_at";

/** PostgREST error message we can show verbatim to the user. */
export function readableError(error: { message?: string; code?: string } | null) {
  if (!error) return null;

  const message = error.message ?? "Something went wrong.";
  const code = error.code ?? "";

  // 42883 / PGRST202 => the claim_listing() function has not been created yet.
  if (
    code === "42883" ||
    code === "PGRST202" ||
    /could not find the function/i.test(message)
  ) {
    return "The claim_listing() function is missing. Run supabase/migrations/002_surplus_listings.sql in the Supabase SQL editor.";
  }

  // 42P01 / PGRST205 => the surplus_listings table has not been created yet.
  if (
    code === "42P01" ||
    code === "PGRST205" ||
    /could not find the table|schema cache/i.test(message)
  ) {
    return "The surplus_listings table is missing. Run supabase/migrations/002_surplus_listings.sql in the Supabase SQL editor.";
  }

  return message;
}

/**
 * Errors raised by the phase-3 ESG objects: the `estimated_kg` column and the
 * `get_platform_impact()` function. Both only exist once
 * `supabase/migrations/003_esg_stats.sql` has been applied, so PostgREST's
 * "schema cache" / "does not exist" errors are translated into that one
 * instruction instead of a raw Postgres string.
 */
export function esgError(error: { message?: string; code?: string } | null) {
  if (!error) return null;

  const message = error.message ?? "Something went wrong.";
  const code = error.code ?? "";

  // 42883 / PGRST202 => function missing, 42703 / PGRST204 => column missing.
  if (
    code === "42883" ||
    code === "PGRST202" ||
    code === "42703" ||
    code === "PGRST204" ||
    /get_platform_impact|estimated_kg/i.test(message)
  ) {
    return "The phase-3 impact objects are missing. Run supabase/migrations/003_esg_stats.sql in the Supabase SQL editor.";
  }

  // Anything else (missing table, expired session, network) keeps the shared
  // wording from readableError().
  return readableError(error);
}

/** A listing as the charity side sees it (with the publishing kitchen). */
export type BrowsableListing = ListingRow & {
  restaurant: ProfileSummary | null;
};

/** A listing as its own restaurant sees it (with whoever claimed it). */
export type OwnListing = ListingRow & {
  claimer: ProfileSummary | null;
};

/**
 * Embedded relations, normalised.
 *
 * The Supabase client here is untyped (no generated database types), so
 * TypeScript infers a to-many shape for embedded relations. These embeds all
 * follow a many-to-one foreign key, so PostgREST returns a single object (or
 * null) — handle either shape instead of trusting the inferred type.
 */
type RawListing = ListingRow & {
  restaurant?: ProfileSummary | ProfileSummary[] | null;
  claimer?: ProfileSummary | ProfileSummary[] | null;
};

function firstOrNull<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normaliseListings(
  rows: unknown,
): (ListingRow & {
  restaurant: ProfileSummary | null;
  claimer: ProfileSummary | null;
})[] {
  const raw = (rows ?? []) as RawListing[];

  return raw.map((row) => ({
    ...row,
    restaurant: firstOrNull(row.restaurant),
    claimer: firstOrNull(row.claimer),
  }));
}

export async function getSessionProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      profile: null as ProfileRecord | null,
      profileError: null as string | null,
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  return {
    supabase,
    user,
    profile: (data as ProfileRecord | null) ?? null,
    profileError: readableError(error),
  };
}

/** Everything the signed-in restaurant has published, newest first. */
export async function getOwnListings(restaurantId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("surplus_listings")
    .select(
      `${LISTING_COLUMNS}, claimer:profiles!surplus_listings_claimed_by_fkey(organization_name, full_name, city, address, phone)`,
    )
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  return {
    listings: normaliseListings(data) as OwnListing[],
    error: readableError(error),
  };
}

/**
 * Every listing still up for grabs, newest first, with the publishing kitchen
 * embedded so the charity can see who it is collecting from.
 */
export async function getAvailableListings() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("surplus_listings")
    .select(
      `${LISTING_COLUMNS}, restaurant:profiles!surplus_listings_restaurant_id_fkey(organization_name, full_name, city, address, phone)`,
    )
    .eq("status", "available")
    .order("created_at", { ascending: false });

  return {
    listings: normaliseListings(data) as BrowsableListing[],
    error: readableError(error),
  };
}

/** Listings this charity has already claimed, most recently claimed first. */
export async function getClaimedListings(charityId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("surplus_listings")
    .select(
      `${LISTING_COLUMNS}, restaurant:profiles!surplus_listings_restaurant_id_fkey(organization_name, full_name, city, address, phone)`,
    )
    .eq("claimed_by", charityId)
    .order("claimed_at", { ascending: false });

  return {
    listings: normaliseListings(data) as BrowsableListing[],
    error: readableError(error),
  };
}

/* --------------------------------------------------------------------------- */
/* Phase 3 — ESG impact                                                        */
/* --------------------------------------------------------------------------- */

/**
 * The restaurant's own impact: the summed weight of its listings that a charity
 * has claimed or collected.
 *
 * RLS already allows a kitchen to read its own rows, so this is a plain query —
 * no function and no elevated privileges are involved. It is deliberately a
 * *separate* request rather than extra columns on the listing grid: if
 * migration 003 has not been applied yet, only this panel reports the problem
 * while the listings themselves keep rendering.
 */
export async function getRestaurantImpact(restaurantId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("surplus_listings")
    .select("estimated_kg")
    .eq("restaurant_id", restaurantId)
    .in("status", ["claimed", "picked_up"]);

  return {
    impact: restaurantImpactFromRows(data),
    error: esgError(error),
  };
}

/**
 * The platform-wide totals for the public /impact page.
 *
 * `anon` can execute get_platform_impact(), which is SECURITY DEFINER, so the
 * numbers are readable without a session while the underlying rows stay
 * protected by RLS.
 */
export async function getPlatformImpact() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_platform_impact");

  if (error) {
    return {
      impact: null,
      error:
        esgError(error) ?? "The platform totals could not be loaded right now.",
    };
  }

  return { impact: platformImpactFromRow(data), error: null };
}