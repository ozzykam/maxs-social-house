"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { PermissionGate } from "@/components/PermissionGate";
import { createUser } from "@/lib/userService";
import { claimsHavePermission } from "@maxs/services";
import type { Role, ManagerType } from "@maxs/types";

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

export default function NewUserPage() {
  const { user, claims } = useAuth();
  const canManageAdmins = claimsHavePermission(claims, "users:manage_admins");
  const availableRoles = ROLE_OPTIONS.filter((r) => canManageAdmins || !r.adminOnly);

  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [managerType, setManagerType] = useState<ManagerType>("events");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdEmail, setCreatedEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);
    try {
      await createUser({
        email,
        firstName,
        middleInitial: middleInitial || undefined,
        lastName,
        role,
        managerType: role === "manager" ? managerType : undefined,
        createdBy: user.uid,
      });
      setCreatedEmail(email);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (code === "permission-denied") {
        setError("You don't have permission to create this user type.");
      } else {
        setError("Failed to create user. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setCreatedEmail("");
    setFirstName("");
    setMiddleInitial("");
    setLastName("");
    setEmail("");
    setRole("staff");
    setManagerType("events");
    setError("");
  }

  if (createdEmail) {
    return (
      <PermissionGate anyOf={["users:manage_staff", "users:manage_admins"]}>
        <div className="max-w-lg mx-auto px-6 py-8">
          <div className="bg-white border border-gray-200 rounded-xl px-8 py-10 text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto">
              <span className="text-green-600 text-lg font-semibold">✓</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">User created</h2>
            <p className="text-sm text-gray-500">
              A password reset email was sent to{" "}
              <span className="font-medium text-gray-700">{createdEmail}</span>.
              They&apos;ll set their own password on first sign-in.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Add Another
              </button>
              <Link
                href="/users"
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Back to Users
              </Link>
            </div>
          </div>
        </div>
      </PermissionGate>
    );
  }

  return (
    <PermissionGate anyOf={["users:manage_staff", "users:manage_admins"]}>
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/users" className="text-sm text-gray-500 hover:text-gray-700">
            ← Users
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">Add User</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl px-8 py-8 space-y-5"
        >
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
                placeholder="Jane"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400"
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
                placeholder="A"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400"
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
                placeholder="Smith"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400"
            />
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating…" : "Create User"}
          </button>
        </form>
      </div>
    </PermissionGate>
  );
}
