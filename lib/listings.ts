/**
 * Shared listing vocabulary — types, status labels and date helpers.
 *
 * Deliberately dependency-free so both Server and Client Components can import
 * it (no "use server" / "use client" boundary needed).
 */

export type ListingStatus =
  | "available"
  | "claimed"
  | "picked_up"
  | "cancelled";

/** Where each role belongs inside /dashboard. */
export const ROLE_HOME: Record<string, string> = {
  restaurant: "/dashboard/restaurant",
  charity: "/dashboard/charity",
};

export type ProfileSummary = {
  organization_name: string | null;
  full_name: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
};

export type ListingRow = {
  id: string;
  restaurant_id: string;
  food_type: string;
  quantity: string;
  expiry_at: string;
  pickup_address: string | null;
  status: ListingStatus;
  claimed_by: string | null;
  claimed_at: string | null;
  created_at: string;
};

/** A listing plus the profile of the kitchen that published it. */
export type ListingWithRestaurant = ListingRow & {
  restaurant: ProfileSummary | null;
};

export const STATUS_LABEL: Record<ListingStatus, string> = {
  available: "Available",
  claimed: "Claimed",
  picked_up: "Picked up",
  cancelled: "Cancelled",
};

/** Maps to the `.status-pill` variants defined in app/globals.css. */
export const STATUS_CLASS: Record<ListingStatus, string> = {
  available: "status-available",
  claimed: "status-claimed",
  picked_up: "status-picked-up",
  cancelled: "status-cancelled",
};

/** Short, timezone-independent readiness badge driven by absolute timestamps. */
export function expiryState(expiryAt: string, now: Date = new Date()) {
  const expiry = new Date(expiryAt);
  const msLeft = expiry.getTime() - now.getTime();

  if (Number.isNaN(msLeft)) {
    return { label: "No expiry set", tone: "muted" as const };
  }
  if (msLeft <= 0) {
    return { label: "Expired", tone: "muted" as const };
  }
  const hours = msLeft / 3_600_000;
  if (hours < 6) {
    return { label: `Goes off in ${Math.max(1, Math.round(hours))}h`, tone: "urgent" as const };
  }
  if (hours < 24) {
    return { label: `Goes off in ${Math.round(hours)}h`, tone: "soon" as const };
  }
  return { label: `Goes off in ${Math.round(hours / 24)}d`, tone: "calm" as const };
}

export const EXPIRY_TONE_CLASS = {
  urgent: "border-ember-600/40 bg-ember-100 text-ember-900",
  soon: "border-ember-600/25 bg-ember-50 text-ember-800",
  calm: "border-basil-700/25 bg-basil-50 text-basil-800",
  muted: "border-husk-950/12 bg-husk-100 text-husk-600",
} as const;

const NUMERIC_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

/**
 * Stable label for server rendering. Used as the no-JS fallback behind
 * <LocalTime>, which re-renders it in the visitor's own timezone.
 */
export function utcLabel(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${NUMERIC_DATE.format(date)} UTC`;
}