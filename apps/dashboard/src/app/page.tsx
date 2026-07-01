"use client";
import { useAuth } from "@/lib/useAuth";
import { PermissionGate } from "@/components/PermissionGate";
import type { Role, ManagerType } from "@maxs/types";

const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
  customer: "Customer",
};

const MANAGER_TYPE_LABELS: Record<ManagerType, string> = {
  events: "Events Coordinator",
  talent: "Talent Manager",
  cms: "CMS Manager",
};

function formatRole(role?: Role, managerType?: ManagerType): string {
  if (!role) return "";
  if (role === "manager" && managerType) return MANAGER_TYPE_LABELS[managerType];
  return ROLE_LABELS[role];
}

export default function DashboardHome() {
  const { user, claims, userRecord, loading } = useAuth();

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (!user) return <main style={{ padding: 24 }}>Please sign in.</main>;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Max&apos;s Social House — Dashboard</h1>
      <p>Signed in as {userRecord ? `${userRecord.firstName} ${userRecord.lastName}` : user.email} ({formatRole(claims?.role, claims?.managerType)})</p>

      <nav style={{ display: "grid", gap: 8, marginTop: 16 }}>
        <PermissionGate anyOf={["cms:menu", "cms:specials", "cms:events"]}>
          <a href="/cms">Content Management</a>
        </PermissionGate>
        <PermissionGate anyOf={["crm:read"]}>
          <a href="/crm">CRM &amp; Inquiries</a>
        </PermissionGate>
        <PermissionGate anyOf={["bookings:read"]}>
          <a href="/bookings">Bookings &amp; Calendar</a>
        </PermissionGate>
        <PermissionGate anyOf={["invoices:read"]}>
          <a href="/invoicing">Invoicing</a>
        </PermissionGate>
        <PermissionGate anyOf={["entertainment:read"]}>
          <a href="/entertainment">Entertainment</a>
        </PermissionGate>
        <PermissionGate anyOf={["users:manage_staff"]}>
          <a href="/users">User Management</a>
        </PermissionGate>
        <PermissionGate anyOf={["system:integrations"]}>
          <a href="/settings">System Settings</a>
        </PermissionGate>
      </nav>
    </main>
  );
}
