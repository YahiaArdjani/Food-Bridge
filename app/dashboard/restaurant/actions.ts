"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { esgError, readableError } from "@/lib/supabase/queries";

export type ListingActionState = {
  error?: string;
  success?: string;
};

const DASHBOARD = "/dashboard/restaurant";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Publish a surplus listing on behalf of the signed-in restaurant.
 *
 * `expiry_at` arrives as a full ISO string (the form converts the
 * `datetime-local` value in the browser), so the absolute instant is stored
 * regardless of the server's timezone.
 *
 * `estimated_kg` is required (phase 3): it is what the ESG impact figures are
 * summed from. The number input rejects anything non-numeric in the browser,
 * but the parsing below is the check that actually counts.
 */
export async function createListing(
  _prev: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const foodType = text(formData, "food_type");
  const quantity = text(formData, "quantity");
  const pickupAddress = text(formData, "pickup_address");
  const expiryRaw = text(formData, "expiry_at");
  const estimatedRaw = text(formData, "estimated_kg");

  if (!foodType || !quantity || !expiryRaw) {
    return {
      error: "Food type, quantity and a pickup deadline are all required.",
    };
  }

  // Accept "12.5" and "12,5" — the second is what a French or German keyboard
  // produces on the numeric keypad even with input type="number".
  const estimatedKg = Number(estimatedRaw.replace(",", "."));

  if (!estimatedRaw || !Number.isFinite(estimatedKg) || estimatedKg <= 0) {
    return {
      error:
        "Estimated weight has to be a number of kilograms greater than zero (for example 12.5).",
    };
  }

  const expiry = new Date(expiryRaw);
  if (Number.isNaN(expiry.getTime())) {
    return { error: "That pickup deadline could not be read. Pick it again." };
  }
  if (expiry.getTime() <= Date.now()) {
    return { error: "The pickup deadline has to be in the future." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your session expired. Log in again to publish a listing." };
  }

  const { error } = await supabase.from("surplus_listings").insert({
    restaurant_id: user.id,
    food_type: foodType,
    quantity,
    expiry_at: expiry.toISOString(),
    pickup_address: pickupAddress || null,
    estimated_kg: estimatedKg,
    status: "available",
  });

  if (error) {
    return { error: esgError(error) ?? error.message };
  }

  revalidatePath(DASHBOARD);
  redirect(`${DASHBOARD}?published=1`);
}

/**
 * Cancel one of the signed-in restaurant's own listings — only while it is
 * still `available` (the database enforces this too).
 */
export async function cancelListing(
  _prev: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const listingId = text(formData, "listing_id");

  if (!listingId) {
    return { error: "That listing could not be identified." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your session expired. Log in again." };
  }

  const { data, error } = await supabase
    .from("surplus_listings")
    .update({ status: "cancelled" })
    .eq("id", listingId)
    .eq("restaurant_id", user.id)
    .eq("status", "available")
    .select("id");

  if (error) {
    return { error: readableError(error) ?? error.message };
  }

  if (!data || data.length === 0) {
    return { error: "That listing is no longer available to cancel." };
  }

  revalidatePath(DASHBOARD);
  return { success: "Listing cancelled." };
}