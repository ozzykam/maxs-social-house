"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { PermissionGate } from "@/components/PermissionGate";
import { listUsers } from "@/lib/userService";
import type { UserRecord, Role, ManagerType } from "@maxs/types";

function roleLabel(role: Role, managerType?: ManagerType | null): string {
  if (role === "manager") {
    if (managerType === "events") return "Events Coordinator";
    if (managerType === "talent") return "Talent Manager";
    if (managerType === "cms") return "CMS Manager";
    return "Manager";
  }
  const labels: Record<Role, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    manager: "Manager",
    staff: "Staff",
    customer: "Customer",
  };
  return labels[role];
}

export default function UsersPage() {
  const { loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    listUsers()
      .then(setUsers)
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  }, [authLoading]);

  return (
    <PermissionGate
      anyOf={["users:manage_staff", "users:manage_admins"]}
      fallback={
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-sm text-gray-500">You don&apos;t have permission to view this page.</p>
        </div>
      }
    >
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">User Management</h1>
          </div>
          <Link
            href="/users/new"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Add User
          </Link>
        </div>

        {loading && <p className="text-sm text-gray-400">Loading…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.displayName}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {roleLabel(u.role, u.managerType)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {u.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/users/${u.uid}`}
                        className="text-gray-500 hover:text-gray-900 font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
