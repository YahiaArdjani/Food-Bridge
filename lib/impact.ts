/**
 * Phase-3 ESG vocabulary — conversion factors, labels and number formatting.
 *
 * Deliberately dependency-free so both Server and Client Components can import
 * it, and shared by the public /impact page and the "Your impact" panel on the
 * restaurant dashboard so the two can never drift apart.
 *
 * The factors are crude industry averages, which is exactly why every derived
 * figure is labelled "estimated" in the UI — see IMPACT_DISCLAIMER.
 */

/** Kilograms of CO₂e avoided per kilogram of food rescued. */
export const CO2_KG_PER_FOOD_KG = 2.5;

/** Kilograms of food in an average meal. */
export const KG_PER_MEAL = 0.5;

/** Shown under every impact figure, word for word, on every surface. */
export const IMPACT_DISCLAIMER =
  "Estimates based on average conversion factors, not exact measurements.";

export type ImpactTotals = {
  /** Rescued weight, straight from the kitchens' own estimates. */
  totalKg: number;
  /** Derived: totalKg × CO2_KG_PER_FOOD_KG — an estimate. */
  co2Kg: number;
  /** Derived: totalKg ÷ KG_PER_MEAL — an estimate. */
  meals: number;
};

/** The signed-in restaurant's own rescued weight. */
export type RestaurantImpact = {
  totalKg: number;
  /** How many of its listings a charity has claimed or collected. */
  rescuedListingCount: number;
};

/** The platform-wide totals returned by get_platform_impact(). */
export type PlatformImpact = {
  totalKg: number;
  restaurantCount: number;
  charityCount: number;
};

/**
 * PostgREST hands `numeric` back as a JSON number, but a value can still
 * arrive as a string (or be absent, or be nonsense). Normalise it once.
 */
export function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

type ImpactRow = {
  total_kg?: unknown;
  restaurant_count?: unknown;
  charity_count?: unknown;
};

/**
 * Maps the raw payload of `get_platform_impact()` onto the three platform
 * figures.
 *
 * A table-returning Postgres function comes back from supabase.rpc() as an
 * array with exactly one element (every aggregate in the migration uses
 * coalesce / count(*)), but a single JSON object is accepted too so a change
 * in the function signature cannot silently blank the page.
 */
export function platformImpactFromRow(data: unknown): PlatformImpact {
  // A table-returning function arrives from supabase.rpc() as a one-element
  // array; a plain object is accepted too, so a signature change cannot
  // silently blank the page.
  const row = (Array.isArray(data) ? data[0] : data) as
    | ImpactRow
    | null
    | undefined;

  return {
    totalKg: toNumber(row?.total_kg) ?? 0,
    restaurantCount: toNumber(row?.restaurant_count) ?? 0,
    charityCount: toNumber(row?.charity_count) ?? 0,
  };
}

/**
 * Sums a restaurant's own rescued rows (`estimated_kg` only, claimed or
 * picked up). Rows without a weight simply contribute nothing.
 */
export function restaurantImpactFromRows(rows: unknown): RestaurantImpact {
  const list = (Array.isArray(rows) ? rows : []) as {
    estimated_kg?: unknown;
  }[];

  return {
    totalKg: list.reduce(
      (sum, row) => sum + (toNumber(row?.estimated_kg) ?? 0),
      0,
    ),
    rescuedListingCount: list.length,
  };
}

/**
 * Turns a rescued weight into the three headline figures.
 *
 * Anything that is not a finite, non-negative number collapses to zero so a
 * stray NULL from the database (or a NaN from a bad sum) can never render as
 * "NaN kg" in the UI.
 */
export function impactFromKg(totalKg: number): ImpactTotals {
  const kg = Number.isFinite(totalKg) ? Math.max(0, totalKg) : 0;

  return {
    totalKg: kg,
    co2Kg: kg * CO2_KG_PER_FOOD_KG,
    meals: kg / KG_PER_MEAL,
  };
}

const ONE_DECIMAL = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });
const NO_DECIMALS = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });

/**
 * Weight, kept readable at every size: one decimal while the number is small
 * (12.5 kg still means something) and whole kilograms once it is not.
 */
export function formatKg(value: number) {
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
  return (safe < 100 ? ONE_DECIMAL : NO_DECIMALS).format(safe);
}

/** Whole numbers with thousands separators — counts, meals, kilogram totals. */
export function formatCount(value: number) {
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
  return NO_DECIMALS.format(safe);
}

/** Meals are never served in halves of a meal, so round before formatting. */
export function formatMeals(value: number) {
  return formatCount(Math.round(Number.isFinite(value) ? value : 0));
}
