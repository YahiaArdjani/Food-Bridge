import type { ReactNode } from "react";

import { LocalTime } from "@/components/local-time";
import {
  EXPIRY_TONE_CLASS,
  STATUS_CLASS,
  STATUS_LABEL,
  expiryState,
  type ListingRow,
  type ProfileSummary,
} from "@/lib/listings";

type ListingCardProps = {
  listing: ListingRow & { restaurant?: ProfileSummary | null };
  /** Show who published it (the charity side). */
  showRestaurant?: boolean;
  /** Show which charity claimed it (the restaurant side). */
  claimer?: ProfileSummary | null;
  actions?: ReactNode;
};

/**
 * One surplus listing, rendered in the same card idiom as the rest of the site.
 * Purely presentational — the dashboards fetch, this displays.
 */
export function ListingCard({
  listing,
  showRestaurant = false,
  claimer,
  actions,
}: ListingCardProps) {
  const expiry = expiryState(listing.expiry_at);
  const restaurant = listing.restaurant ?? null;
  const restaurantName =
    restaurant?.organization_name ?? restaurant?.full_name ?? null;

  return (
    <article className="card flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-snug font-semibold text-husk-950">
            {listing.food_type}
          </h3>
          <p className="mt-1 text-sm text-husk-600">{listing.quantity}</p>
        </div>
        <span className={`status-pill ${STATUS_CLASS[listing.status]}`}>
          {STATUS_LABEL[listing.status]}
        </span>
      </header>

      <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="field-label">Pickup by</dt>
          <dd className="text-husk-900">
            <LocalTime iso={listing.expiry_at} />
          </dd>
          <dd className="mt-1.5">
            <span className={`status-pill ${EXPIRY_TONE_CLASS[expiry.tone]}`}>
              {expiry.label}
            </span>
          </dd>
        </div>

        <div>
          <dt className="field-label">Pickup address</dt>
          <dd className="text-husk-900">
            {listing.pickup_address?.trim() || "Ask the kitchen"}
          </dd>
        </div>

        {showRestaurant && (
          <div>
            <dt className="field-label">From</dt>
            <dd className="text-husk-900">
              {restaurantName ?? "Unknown kitchen"}
              {restaurant?.city ? (
                <span className="block text-xs text-husk-600">
                  {restaurant.city}
                </span>
              ) : null}
            </dd>
          </div>
        )}

        <div>
          <dt className="field-label">Published</dt>
          <dd className="text-husk-900">
            <LocalTime iso={listing.created_at} />
          </dd>
        </div>

        {claimer && listing.claimed_by ? (
          <div>
            <dt className="field-label">Claimed by</dt>
            <dd className="text-husk-900">
              {claimer.organization_name ?? claimer.full_name ?? "A charity"}
              {claimer.phone ? (
                <span className="block text-xs text-husk-600">
                  {claimer.phone}
                </span>
              ) : null}
              {claimer.city ? (
                <span className="block text-xs text-husk-600">
                  {claimer.city}
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}

        {listing.claimed_at && (
          <div>
            <dt className="field-label">
              {showRestaurant ? "Claimed" : "Claimed by a charity"}
            </dt>
            <dd className="text-husk-900">
              <LocalTime iso={listing.claimed_at} />
            </dd>
          </div>
        )}
      </dl>

      {actions ? (
        <footer className="flex flex-wrap items-center gap-3 border-t-2 border-dashed border-husk-950/15 pt-4">
          {actions}
        </footer>
      ) : null}
    </article>
  );
}

/** Consistent empty / error state for the listing sections. */
export function ListingNotice({
  title,
  body,
  tone = "quiet",
}: {
  title: string;
  body: string;
  tone?: "quiet" | "warning";
}) {
  return (
    <div
      role={tone === "warning" ? "status" : undefined}
      className={
        tone === "warning"
          ? "rounded-2xl border-2 border-ember-600/40 bg-ember-50 px-5 py-4 text-sm leading-relaxed text-ember-900"
          : "rounded-2xl border-2 border-dashed border-husk-950/20 px-5 py-6 text-sm leading-relaxed text-husk-600"
      }
    >
      <p className="font-display text-base font-semibold text-husk-950">
        {title}
      </p>
      <p className="mt-1.5">{body}</p>
    </div>
  );
}