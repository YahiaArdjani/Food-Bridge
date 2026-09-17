import type { Metadata } from "next";
import { RoleDashboard } from "@/components/role-dashboard";

export const metadata: Metadata = { title: "Charity dashboard" };

export default function CharityDashboardPage() {
  return <RoleDashboard role="charity" />;
}
