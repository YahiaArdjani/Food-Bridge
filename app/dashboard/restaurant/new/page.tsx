import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RoleDashboard } from "@/components/role-dashboard";
import { ROLE_HOME } from "@/lib/listings";
import { getSessionProfile } from "@/lib/supabase/queries";

import { ListingForm } from "../listing-form";

export const metadata: Metadata = { title: "Publish surplus" };

export default async function NewListingPage() {
  const { user, profile, profileError } = await getSessionProfile();

  if (!user) {
    redirect("/login?error=session");
  }

  if (profile && profile.role !== "restaurant") {
    redirect(ROLE_HOME[profile.role] ?? "/dashboard");
  }

  return (
    <RoleDashboard
      role="restaurant"
      email={user.email}
      profile={profile}
      profileError={profileError}
    >
      <div className="max-w-3xl">
        <ListingForm defaultAddress={profile?.address ?? null} />
      </div>
    </RoleDashboard>
  );
}