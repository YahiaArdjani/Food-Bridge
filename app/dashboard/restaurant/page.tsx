import type { Metadata } from "next";
import { RoleDashboard } from "@/components/role-dashboard";

export const metadata: Metadata = { title: "Restaurant dashboard" };

export default function RestaurantDashboardPage() {
  return <RoleDashboard role="restaurant" />;
}
