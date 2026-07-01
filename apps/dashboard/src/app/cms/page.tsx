"use client";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import type { Permission } from "@maxs/types";

const MODULES: { href: string; label: string; description: string; permissions: Permission[] }[] = [
  {
    href: "/cms/menu",
    label: "Menu",
    description: "Manage food & drink items and categories",
    permissions: ["cms:menu"],
  },
  {
    href: "/cms/specials",
    label: "Specials",
    description: "Time-limited promotions and featured specials",
    permissions: ["cms:specials"],
  },
  {
    href: "/cms/events",
    label: "Events",
    description: "Public event listings and the entertainment calendar",
    permissions: ["cms:events"],
  },
  {
    href: "/cms/media",
    label: "Media Library",
    description: "Upload and manage photos and video",
    permissions: ["cms:media"],
  },
  {
    href: "/cms/settings",
    label: "Hours & Settings",
    description: "Business hours, contact info, and social links",
    permissions: ["cms:settings"],
  },
];

export default function CmsIndexPage() {
  return (
    <PermissionGate anyOf={["cms:menu", "cms:specials", "cms:events", "cms:media", "cms:settings"]}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">Content Management</h1>
        </div>

        <div className="grid gap-3">
          {MODULES.map((m) => (
            <PermissionGate key={m.href} anyOf={m.permissions}>
              <Link
                href={m.href}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-6 py-4 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div>
                  <p className="font-medium text-gray-900">{m.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{m.description}</p>
                </div>
                <span className="text-gray-400 text-lg ml-4">→</span>
              </Link>
            </PermissionGate>
          ))}
        </div>
      </div>
    </PermissionGate>
  );
}
