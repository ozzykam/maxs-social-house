"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { PermissionGate } from "@/components/PermissionGate";
import { getUserById, updateUser } from "@/lib/userService";
import { PermissionOverridesEditor } from "@/components/PermissionOverridesEditor";
import { claimsHavePermission } from "@maxs/services";
import type { UserRecord, Role, ManagerType, PermissionOverrides } from "@maxs/types";

const ROLE_OPTIONS: { value: Role; label: string; adminOnly: boolean }[] = [
  { value: "super_admin", label: "Super Admin", adminOnly: true },
  { value: "admin", label: "Admin", adminOnly: true },
  { value: "manager", label: "Manager", adminOnly: false },
  { value: "staff", label: "Staff", adminOnly: false },
];

const MANAGER_TYPE_OPTIONS: { value: ManagerType; label: string }[] = [
  { value: "events", label: "Events Coordinator" },
  { value: "talent", label: "Talent Manager" },
  { value: "cms", label: "CMS Manager" },
];

export default function EditUserPage() {
  const { uid } = useParams<{ uid: string }>();
  const { claims } = useAuth();
  const router = useRouter();
  const canManageAdmins = claimsHavePermission(claims, "users:manage_admins");
  const availableRoles = ROLE_OPTIONS.filter((r) => canManageAdmins || !r.adminOnly);

  const [record, setRecord] = useState<UserRecord | null>(null);
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [managerType, setManagerType] = useState<ManagerType>("events");
  const [active, setActive] = useState(true);
  const [overrides, setOverrides] = useState<PermissionOverrides>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getUserById(uid)
      .then((u) => {
        if (!u) { setError("User not found."); return; }
        setRecord(u);
        // Fall back to parsing displayName for records created before the name split.
        setFirstName(u.firstName ?? u.displayName.split(" ")[0] ?? "");
        setMiddleInitial(u.middleInitial ?? "");
        setLastName(u.lastName ?? u.displayName.split(" ").slice(1).join(" ") ?? "");
        setRole(u.role);
        setManagerType(u.managerType ?? "events");
        setActive(u.active);
        setOverrides(u.permissionOverrides ?? {});
      })
      .catch(() => setError("Failed to load user."))
      .finally(() => setLoading(false));
  }, [uid]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateUser(uid, {
        firstName,
        middleInitial: middleInitial || null,
        lastName,
        role,
        managerType: role === "manager" ? managerType : null,
        active,
        permissionOverrides:
          overrides.grant?.length || overrides.revoke?.length ? overrides : null,
      });
      router.push("/users");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "permission-denied") {
        setError("You don't have permission to make this change.");
      } else {
        setError("Failed to save changes. Please try again.");
      }
      setSaving(false);
    }
  }

  return (
    <PermissionGate anyOf={["users:manage_staff", "users:manage_admins"]}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/users" className="text-sm text-gray-500 hover:text-gray-700">
            ← Users
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">Edit User</h1>
        </div>

        {loading && <p className="text-sm text-gray-400">Loading…</p>}
        {error && !loading && <p className="text-sm text-red-600">{error}</p>}

        {!loading && record && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-xl px-8 py-8 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <p className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">
                {record.email}
              </p>
            </div>

            <div className="grid grid-cols-[1fr_80px_1fr] gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="middleInitial" className="block text-sm font-medium text-gray-700 mb-1.5">
                  M.I.
                </label>
                <input
                  id="middleInitial"
                  type="text"
                  maxLength={1}
                  value={middleInitial}
                  onChange={(e) => setMiddleInitial(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
              >
                {availableRoles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {role === "manager" && (
              <div>
                <label htmlFor="managerType" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Manager Type
                </label>
                <select
                  id="managerType"
                  value={managerType}
                  onChange={(e) => setManagerType(e.target.value as ManagerType)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                >
                  {MANAGER_TYPE_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <PermissionOverridesEditor
              role={role}
              managerType={role === "manager" ? managerType : null}
              value={overrides}
              onChange={setOverrides}
            />

            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-gray-700">Active</span>
              <button
                type="button"
                role="switch"
                aria-checked={active}
                onClick={() => setActive(!active)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 ${
                  active ? "bg-gray-900" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    active ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3 pt-1">
              <Link
                href="/users"
                className="flex-1 text-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </PermissionGate>
  );
}
