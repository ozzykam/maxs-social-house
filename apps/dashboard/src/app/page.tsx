"use client";
import { useAuth } from "@/lib/useAuth";
import { PermissionGate } from "@/components/PermissionGate";

// Starter dashboard home. Each module link is gated by the permissions that
// module requires. Replace with the real nav + module routes during build.
export default function DashboardHome() {
  const { user, claims, loading } = useAuth();

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (!user) return <main style={{ padding: 24 }}>Please sign in.</main>;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Max&apos;s Social House — Dashboard</h1>
      <p>Signed in as {user.email} ({claims?.role})</p>

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
