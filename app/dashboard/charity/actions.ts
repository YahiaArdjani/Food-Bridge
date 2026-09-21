"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { readableError } from "@/lib/supabase/queries";

export type ClaimActionState = {
  error?: string;
  success?: string;
};

/**
 * Claim a listing through the `claim_listing()` Postgres function.
 *
 * All the rules live in the database: the caller must be a charity, the listing
 * must still be `available`, and the status check is part of the same UPDATE, so
 * two charities racing for the same tray cannot both win.
 */
export async function claimListing(
  _prev: ClaimActionState,
  formData: FormData,
): Promise<ClaimActionState> {
  const raw = formData.get("listing_id");
  const listingId = typeof raw === "string" ? raw.trim() : "";

  if (!listingId) {
    return { error: "That listing could not be identified." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your session expired. Log in again to claim a pickup." };
  }

  const { error } = await supabase.rpc("claim_listing", {
    listing_id: listingId,
  });

  if (error) {
    return { error: readableError(error) ?? error.message };
  }

  revalidatePath("/dashboard/charity");
  return { success: "Claimed. Get in touch with the kitchen to arrange pickup." };
}