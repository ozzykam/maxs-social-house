"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import { listInquiriesByType } from "@/lib/crmService";
import type { Inquiry } from "@maxs/types";

type InquiryRow = Inquiry & { contactName?: string; contactEmail?: string };

const STAGE_STYLES: Record<string, string> = {
  new: "bg-amber-50 text-amber-700",
  contacted: "bg-blue-50 text-blue-700",
  tour_scheduled: "bg-indigo-50 text-indigo-700",
  proposal_sent: "bg-violet-50 text-violet-700",
  contract_sent: "bg-purple-50 text-purple-700",
  booked: "bg-green-50 text-green-700",
  deposit_paid: "bg-teal-50 text-teal-700",
  completed: "bg-green-50 text-green-700",
  follow_up: "bg-orange-50 text-orange-700",
  lost: "bg-red-50 text-red-600",
};

const STAGE_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  tour_scheduled: "Tour Scheduled",
  proposal_sent: "Proposal Sent",
  contract_sent: "Contract Sent",
  booked: "Booked",
  deposit_paid: "Deposit Paid",
  completed: "Completed",
  follow_up: "Follow Up",
  lost: "Lost",
};

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PrivateEventInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listInquiriesByType("event_space").then((data) => {
      setInquiries(data);
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
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">Private Event Inquiries</h1>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : inquiries.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl px-8 py-12 text-center">
            <p className="text-sm text-gray-400">No private event inquiries yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="flex items-center px-6 py-4 border-b border-gray-100 last:border-0 gap-4"
              >
                <div className="w-44 shrink-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{inq.contactName ?? "—"}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{inq.contactEmail}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{inq.eventType ?? "—"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {inq.preferredDates?.[0] ?? "No date specified"}
                  </p>
                </div>

                <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${STAGE_STYLES[inq.stage] ?? "bg-gray-100 text-gray-500"}`}>
                  {STAGE_LABELS[inq.stage] ?? inq.stage}
                </span>

                <p className="text-xs text-gray-400 shrink-0 w-24 text-right">
                  {formatDate(inq.submittedAt)}
                </p>

                <Link
                  href={`/crm/inquiries/${inq.id}`}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors shrink-0"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
