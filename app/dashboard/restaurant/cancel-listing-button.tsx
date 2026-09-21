"use client";

import { useActionState } from "react";

import { cancelListing, type ListingActionState } from "./actions";

const initialState: ListingActionState = {};

/** Cancels an `available` listing. The database refuses any other transition. */
export function CancelListingButton({ listingId }: { listingId: string }) {
  const [state, formAction, isPending] = useActionState(
    cancelListing,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="listing_id" value={listingId} />
      <button
        type="submit"
        disabled={isPending}
        className="btn btn-danger px-4 py-2 text-xs"
      >
        {isPending ? "Cancelling…" : "Cancel listing"}
      </button>

      {state.error ? (
        <span role="alert" className="text-xs font-medium text-ember-800">
          {state.error}
        </span>
      ) : null}
      {state.success ? (
        <span role="status" className="text-xs font-medium text-basil-800">
          {state.success}
        </span>
      ) : null}
    </form>
  );
}