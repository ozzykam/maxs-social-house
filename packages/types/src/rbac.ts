// packages/types/src/rbac.ts
// Shared RBAC types used by both apps and by Cloud Functions.
// This is the single source of truth for roles and permissions.
// See PHASE_1_SPEC.md Section 3 for full design rationale.

export type Role = "super_admin" | "admin" | "manager" | "staff" | "customer";

export type ManagerType = "events" | "talent" | "cms";

export type Permission =
  // CMS
  | "cms:menu"
  | "cms:specials"
  | "cms:events"
  | "cms:media"
  | "cms:settings"
  // CRM
  | "crm:read"
  | "crm:write"
  | "crm:delete"
  // Bookings
  | "bookings:read"
  | "bookings:write"
  | "bookings:delete"
  // Invoicing
  | "invoices:read"
  | "invoices:write"
  | "invoices:void"
  // Payments
  | "payments:read"
  | "payments:collect"
  | "payments:refund"
  // Entertainment
  | "entertainment:read"
  | "entertainment:write"
  // Ticketing
  | "tickets:read"
  | "tickets:write"
  | "tickets:manage"
  // Users
  | "users:manage_staff"
  | "users:manage_admins"
  // System
  | "system:integrations"
  // Reports
  | "reports:financial"
  | "reports:operational";

export interface PermissionOverrides {
  grant?: Permission[];
  revoke?: Permission[];
}

export interface UserRecord {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  managerType?: ManagerType;
  permissionOverrides?: PermissionOverrides;
  active: boolean;
  createdBy: string;
  createdAt: number; // epoch millis
  updatedAt: number;
}

export interface CustomClaims {
  role: Role;
  managerType?: ManagerType;
  permissions: Permission[];
}

// Default permission sets per role.
// IMPORTANT: This map is the canonical source for what each role grants.
// Both the seed script and the Cloud Function that resolves claims on
// user-write should import from here rather than duplicating the lists.
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    "cms:menu", "cms:specials", "cms:events", "cms:media", "cms:settings",
    "crm:read", "crm:write", "crm:delete",
    "bookings:read", "bookings:write", "bookings:delete",
    "invoices:read", "invoices:write", "invoices:void",
    "payments:read", "payments:collect", "payments:refund",
    "entertainment:read", "entertainment:write",
    "tickets:read", "tickets:write", "tickets:manage",
    "users:manage_staff", "users:manage_admins",
    "system:integrations",
    "reports:financial", "reports:operational",
  ],
  admin: [
    "cms:menu", "cms:specials", "cms:events", "cms:media", "cms:settings",
    "crm:read", "crm:write", "crm:delete",
    "bookings:read", "bookings:write", "bookings:delete",
    "invoices:read", "invoices:write", "invoices:void",
    "payments:read", "payments:collect", "payments:refund",
    "entertainment:read", "entertainment:write",
    "tickets:read", "tickets:write", "tickets:manage",
    "users:manage_staff",
    "reports:financial", "reports:operational",
    // Admins do NOT get users:manage_admins or system:integrations
  ],
  manager: [
    // Base manager permissions are intentionally minimal.
    // Real access is layered on via managerType in resolvePermissions().
    "reports:operational",
  ],
  staff: [
    "bookings:read", // scoped further to "today/this week" at the query level, not the permission level
  ],
  customer: [
    // Customers never get role-based permissions from this map.
    // Their access is enforced via Firestore rules matching contactId === auth.uid,
    // not via the Permission system. See PHASE_1_SPEC.md Section 3.5.
  ],
};

// Additional permissions layered onto "manager" role based on managerType.
export const MANAGER_TYPE_PERMISSIONS: Record<ManagerType, Permission[]> = {
  events: [
    "crm:read", "crm:write",
    "bookings:read", "bookings:write",
    "invoices:read", "invoices:write",
    "payments:read", "payments:collect",
  ],
  talent: [
    "entertainment:read", "entertainment:write",
    "tickets:read", "tickets:write", "tickets:manage",
    "cms:media",
    "bookings:read", // read-only visibility into the shared space calendar
  ],
  cms: [
    "cms:menu", "cms:specials", "cms:events", "cms:media",
  ],
};

/**
 * Resolves the final permission list for a user given their role,
 * managerType, and any individual overrides.
 * This is the function both the Cloud Function (claims-setting) and
 * any server-side guard should call. Do not duplicate this logic.
 */
export function resolvePermissions(
  role: Role,
  managerType: ManagerType | undefined,
  overrides: PermissionOverrides | undefined
): Permission[] {
  let permissions = new Set<Permission>(DEFAULT_ROLE_PERMISSIONS[role]);

  if (role === "manager" && managerType) {
    for (const p of MANAGER_TYPE_PERMISSIONS[managerType]) {
      permissions.add(p);
    }
  }

  if (overrides?.grant) {
    for (const p of overrides.grant) permissions.add(p);
  }
  if (overrides?.revoke) {
    for (const p of overrides.revoke) permissions.delete(p);
  }

  return Array.from(permissions);
}
