"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { createListing, type ListingActionState } from "./actions";

const initialState: ListingActionState = {};

export function ListingForm({
  defaultAddress,
}: {
  defaultAddress?: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    createListing,
    initialState,
  );
  const [expiryLocal, setExpiryLocal] = useState("");

  const expiryIso = (() => {
    if (!expiryLocal) return "";
    const parsed = new Date(expiryLocal);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
  })();

  return (
    <form action={formAction} className="card-stamp">
      <span className="eyebrow">New listing</span>
      <h2 className="mt-3 font-display text-3xl font-semibold">
        Publish surplus
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-husk-600">
        Keep it short and honest — a charity decides from these four lines
        whether it can collect tonight.
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="food_type">
            What is it?
          </label>
          <input
            id="food_type"
            name="food_type"
            required
            maxLength={120}
            className="field-input"
            placeholder="Sourdough loaves and vegetable trays"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="quantity">
            How much?
          </label>
          <input
            id="quantity"
            name="quantity"
            required
            maxLength={80}
            className="field-input"
            placeholder="10 portions"
          />
          <p className="field-hint">
            Free text — “10 portions”, “2 crates”, “about 5 kg”.
          </p>
        </div>

        <div>
          <label className="field-label" htmlFor="expiry_local">
            Collect before
          </label>
          <input
            id="expiry_local"
            type="datetime-local"
            required
            value={expiryLocal}
            onChange={(event) => setExpiryLocal(event.target.value)}
            className="field-input"
          />
          <p className="field-hint">
            {expiryIso
              ? `Saved as ${new Date(expiryIso).toLocaleString()} (your local time).`
              : "Your local time — we store the exact instant. It has to be in the future."}
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="pickup_address">
            Pickup address
          </label>
          <input
            id="pickup_address"
            name="pickup_address"
            defaultValue={defaultAddress ?? ""}
            maxLength={200}
            className="field-input"
            placeholder="12 rue des Halles, side door"
          />
          <p className="field-hint">
            Where should the charity come? Leave it blank to use your profile
            address.
          </p>
        </div>
      </div>

      {/* The value the server action actually reads (exact instant, any TZ). */}
      <input type="hidden" name="expiry_at" value={expiryIso} />

      {state.error ? (
        <p
          role="alert"
          className="mt-6 rounded-2xl border-2 border-ember-600/40 bg-ember-50 px-4 py-3 text-sm text-ember-900"
        >
          {state.error}
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary px-6 py-3"
        >
          {isPending ? "Publishing…" : "Publish listing"}
        </button>
        <Link href="/dashboard/restaurant" className="btn btn-outline px-6 py-3">
          Back to my listings
        </Link>
      </div>

      <p className="field-hint">
        No photos, maps or notifications in this phase — those come later.
      </p>
    </form>
  );
}