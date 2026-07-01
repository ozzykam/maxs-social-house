"use client";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";

export default function CrmIndexPage() {
  return (
    <PermissionGate anyOf={["crm:read"]}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">CRM &amp; Inquiries</h1>
        </div>

        <div className="grid gap-3">
          <Link
            href="/crm/inquiries"
            className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-6 py-4 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div>
              <p className="font-medium text-gray-900">Inquiries</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Private event and talent booking submissions
              </p>
            </div>
            <span className="text-gray-400 text-lg ml-4">→</span>
          </Link>
        </div>
      </div>
    </PermissionGate>
  );
}
