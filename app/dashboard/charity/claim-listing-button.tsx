"use client";

import { useActionState } from "react";

import { claimListing, type ClaimActionState } from "./actions";

const initialState: ClaimActionState = {};

/** Claims a listing through the atomic `claim_listing()` database function. */
export function ClaimListingButton({
  listingId,
  foodType,
}: {
  listingId: string;
  foodType: string;
}) {
  const [state, formAction, isPending] = useActionState(
    claimListing,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="listing_id" value={listingId} />
      <button
        type="submit"
        disabled={isPending}
        aria-label={`Claim ${foodType}`}
        className="btn btn-accent px-5 py-2 text-xs"
      >
        {isPending ? "Claiming…" : "Claim pickup"}
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