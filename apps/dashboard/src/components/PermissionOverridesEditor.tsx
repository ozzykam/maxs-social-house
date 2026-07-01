"use client";
import type { Permission, PermissionOverrides, Role, ManagerType } from "@maxs/types";
import { DEFAULT_ROLE_PERMISSIONS, MANAGER_TYPE_PERMISSIONS } from "@maxs/types";

const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  {
    label: "CMS",
    permissions: ["cms:menu", "cms:specials", "cms:events", "cms:media", "cms:settings"],
  },
  { label: "CRM", permissions: ["crm:read", "crm:write", "crm:delete"] },
  { label: "Bookings", permissions: ["bookings:read", "bookings:write", "bookings:delete"] },
  { label: "Invoicing", permissions: ["invoices:read", "invoices:write", "invoices:void"] },
  { label: "Payments", permissions: ["payments:read", "payments:collect", "payments:refund"] },
  { label: "Entertainment", permissions: ["entertainment:read", "entertainment:write"] },
  { label: "Tickets", permissions: ["tickets:read", "tickets:write", "tickets:manage"] },
  { label: "Users", permissions: ["users:manage_staff", "users:manage_admins"] },
  { label: "System", permissions: ["system:integrations"] },
  { label: "Reports", permissions: ["reports:financial", "reports:operational"] },
];

const PERM_LABELS: Record<Permission, string> = {
  "cms:menu": "Menu",
  "cms:specials": "Specials",
  "cms:events": "Events",
  "cms:media": "Media",
  "cms:settings": "Settings",
  "crm:read": "Read",
  "crm:write": "Write",
  "crm:delete": "Delete",
  "bookings:read": "Read",
  "bookings:write": "Write",
  "bookings:delete": "Delete",
  "invoices:read": "Read",
  "invoices:write": "Write",
  "invoices:void": "Void",
  "payments:read": "Read",
  "payments:collect": "Collect",
  "payments:refund": "Refund",
  "entertainment:read": "Read",
  "entertainment:write": "Write",
  "tickets:read": "Read",
  "tickets:write": "Write",
  "tickets:manage": "Manage",
  "users:manage_staff": "Manage Staff",
  "users:manage_admins": "Manage Admins",
  "system:integrations": "Integrations",
  "reports:financial": "Financial",
  "reports:operational": "Operational",
};

interface Props {
  role: Role;
  managerType: ManagerType | null;
  value: PermissionOverrides;
  onChange: (overrides: PermissionOverrides) => void;
}

export function PermissionOverridesEditor({ role, managerType, value, onChange }: Props) {
  const rolePerms = new Set<Permission>([
    ...DEFAULT_ROLE_PERMISSIONS[role],
    ...(role === "manager" && managerType ? MANAGER_TYPE_PERMISSIONS[managerType] : []),
  ]);

  const granted = new Set<Permission>(value.grant ?? []);
  const revoked = new Set<Permission>(value.revoke ?? []);

  function toggle(perm: Permission, col: "grant" | "revoke") {
    const newGranted = new Set(granted);
    const newRevoked = new Set(revoked);

    if (col === "grant") {
      if (newGranted.has(perm)) {
        newGranted.delete(perm);
      } else {
        newGranted.add(perm);
        newRevoked.delete(perm);
      }
    } else {
      if (newRevoked.has(perm)) {
        newRevoked.delete(perm);
      } else {
        newRevoked.add(perm);
        newGranted.delete(perm);
      }
    }

    onChange({
      grant: newGranted.size > 0 ? Array.from(newGranted) : undefined,
      revoke: newRevoked.size > 0 ? Array.from(newRevoked) : undefined,
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Permission Overrides</span>
        <div className="flex gap-5 text-xs font-medium text-gray-500 pr-0.5">
          <span>Grant</span>
          <span>Revoke</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        Grant adds permissions on top of the role. Revoke strips permissions the role would normally give.
      </p>
      <div className="border border-gray-200 rounded-lg overflow-hidden text-sm">
        {PERMISSION_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
              {group.label}
            </div>
            {group.permissions.map((perm) => {
              const fromRole = rolePerms.has(perm);
              const isGranted = granted.has(perm);
              const isRevoked = revoked.has(perm);

              return (
                <div
                  key={perm}
                  className="flex items-center px-3 py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <span className="flex-1 text-gray-700">{PERM_LABELS[perm]}</span>
                  {fromRole && (
                    <span className="text-xs text-gray-400 mr-4 shrink-0">from role</span>
                  )}
                  <div className="flex gap-6 shrink-0">
                    <input
                      type="checkbox"
                      checked={isGranted}
                      onChange={() => toggle(perm, "grant")}
                      aria-label={`Grant ${perm}`}
                      className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                    />
                    <input
                      type="checkbox"
                      checked={isRevoked}
                      onChange={() => toggle(perm, "revoke")}
                      aria-label={`Revoke ${perm}`}
                      className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
