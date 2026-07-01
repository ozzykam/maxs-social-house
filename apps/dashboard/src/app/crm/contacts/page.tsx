"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import { listContacts } from "@/lib/crmService";
import type { Contact, ContactType } from "@maxs/types";

const TYPE_STYLES: Record<ContactType, string> = {
  event_client: "bg-blue-50 text-blue-700",
  performer: "bg-purple-50 text-purple-700",
  general: "bg-gray-100 text-gray-600",
};

const TYPE_LABELS: Record<ContactType, string> = {
  event_client: "Event Client",
  performer: "Performer",
  general: "General",
};

const SOURCE_LABELS: Record<string, string> = {
  website_inquiry: "Web Form",
  referral: "Referral",
  walk_in: "Walk-in",
  phone: "Phone",
  direct: "Direct",
};

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listContacts().then((data) => {
      setContacts(data);
      setLoading(false);
    });
  }, []);

  return (
    <PermissionGate anyOf={["crm:read"]}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/crm" className="text-sm text-gray-500 hover:text-gray-700">
            ← CRM
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">Contacts</h1>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : contacts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl px-8 py-12 text-center">
            <p className="text-sm text-gray-400">No contacts yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="flex items-center px-6 py-4 border-b border-gray-100 last:border-0 gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{c.email}</p>
                </div>

                <p className="text-sm text-gray-500 shrink-0 w-32 truncate">{c.phone || "—"}</p>

                <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${TYPE_STYLES[c.type] ?? "bg-gray-100 text-gray-500"}`}>
                  {TYPE_LABELS[c.type] ?? c.type}
                </span>

                <p className="text-xs text-gray-400 shrink-0 w-20 text-center">
                  {SOURCE_LABELS[c.source] ?? c.source}
                </p>

                <p className="text-xs text-gray-400 shrink-0 w-24 text-right">
                  {formatDate(c.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
