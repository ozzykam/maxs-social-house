"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import { useAuth } from "@/lib/useAuth";
import {
  getInquiryById,
  getContactById,
  updateInquiryStage,
  listInquiryNotes,
  addInquiryNote,
} from "@/lib/crmService";
import type { Inquiry, Contact, InquiryNote, EventSpaceStage, TalentStage } from "@maxs/types";

type InquiryWithDenorm = Inquiry & { contactName?: string; contactEmail?: string };

const EVENT_SPACE_STAGES: { value: EventSpaceStage; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "tour_scheduled", label: "Tour Scheduled" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "contract_sent", label: "Contract Sent" },
  { value: "booked", label: "Booked" },
  { value: "deposit_paid", label: "Deposit Paid" },
  { value: "completed", label: "Completed" },
  { value: "follow_up", label: "Follow Up" },
  { value: "lost", label: "Lost" },
];

const TALENT_STAGES: { value: TalentStage; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_discussion", label: "In Discussion" },
  { value: "confirmed", label: "Confirmed" },
  { value: "contracted", label: "Contracted" },
  { value: "completed", label: "Completed" },
  { value: "declined", label: "Declined" },
];

const TYPE_STYLES: Record<string, string> = {
  event_space: "bg-blue-50 text-blue-700",
  talent: "bg-purple-50 text-purple-700",
};
const TYPE_LABELS: Record<string, string> = {
  event_space: "Private Event",
  talent: "Talent",
};

const STAGE_STYLES: Record<string, string> = {
  new: "bg-amber-50 text-amber-700",
  contacted: "bg-blue-50 text-blue-700",
  in_discussion: "bg-blue-50 text-blue-700",
  tour_scheduled: "bg-indigo-50 text-indigo-700",
  confirmed: "bg-indigo-50 text-indigo-700",
  proposal_sent: "bg-violet-50 text-violet-700",
  contracted: "bg-violet-50 text-violet-700",
  contract_sent: "bg-purple-50 text-purple-700",
  booked: "bg-green-50 text-green-700",
  deposit_paid: "bg-teal-50 text-teal-700",
  completed: "bg-green-50 text-green-700",
  follow_up: "bg-orange-50 text-orange-700",
  lost: "bg-red-50 text-red-600",
  declined: "bg-red-50 text-red-600",
};

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function formatTs(ms: number): string {
  return new Date(ms).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default function InquiryDetailPage() {
  const { inquiryId } = useParams<{ inquiryId: string }>();
  const { user } = useAuth();

  const [inquiry, setInquiry] = useState<InquiryWithDenorm | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [notes, setNotes] = useState<InquiryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedStage, setSelectedStage] = useState<EventSpaceStage | TalentStage>("new");
  const [stageSaving, setStageSaving] = useState(false);
  const [stageSuccess, setStageSuccess] = useState(false);

  const [noteText, setNoteText] = useState("");
  const [noteAdding, setNoteAdding] = useState(false);

  useEffect(() => {
    async function load() {
      const inq = await getInquiryById(inquiryId);
      if (!inq) { setError("Inquiry not found."); setLoading(false); return; }
      const [ct, noteList] = await Promise.all([
        getContactById(inq.contactId),
        listInquiryNotes(inquiryId),
      ]);
      setInquiry(inq);
      setContact(ct);
      setNotes(noteList);
      setSelectedStage(inq.stage);
      setLoading(false);
    }
    load().catch(() => { setError("Failed to load inquiry."); setLoading(false); });
  }, [inquiryId]);

  async function handleStageUpdate() {
    if (!user || !inquiry) return;
    setStageSaving(true);
    setStageSuccess(false);
    await updateInquiryStage(inquiryId, selectedStage, user.uid);
    setInquiry((prev) => prev ? { ...prev, stage: selectedStage } : prev);
    setStageSaving(false);
    setStageSuccess(true);
    setTimeout(() => setStageSuccess(false), 2000);
  }

  async function handleAddNote() {
    if (!user || !noteText.trim()) return;
    setNoteAdding(true);
    const note = await addInquiryNote(inquiryId, noteText.trim(), user.uid);
    setNotes((prev) => [...prev, note]);
    setNoteText("");
    setNoteAdding(false);
  }

  const stageOptions = inquiry?.type === "talent" ? TALENT_STAGES : EVENT_SPACE_STAGES;

  return (
    <PermissionGate anyOf={["crm:read"]}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/crm/inquiries" className="text-sm text-gray-500 hover:text-gray-700">
            ← Inquiries
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">Inquiry Detail</h1>
        </div>

        {loading && <p className="text-sm text-gray-400">Loading…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && inquiry && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: inquiry details */}
            <div className="md:col-span-2 space-y-5">
              {/* Type + Stage badges */}
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_STYLES[inquiry.type] ?? "bg-gray-100 text-gray-500"}`}>
                  {TYPE_LABELS[inquiry.type] ?? inquiry.type}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full ${STAGE_STYLES[inquiry.stage] ?? "bg-gray-100 text-gray-500"}`}>
                  {stageOptions.find((s) => s.value === inquiry.stage)?.label ?? inquiry.stage}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  Submitted {formatDate(inquiry.submittedAt)}
                </span>
              </div>

              {/* Contact */}
              <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact</h2>
                <p className="font-medium text-gray-900">{contact?.name ?? inquiry.contactName ?? "—"}</p>
                <p className="text-sm text-gray-500 mt-0.5">{contact?.email ?? inquiry.contactEmail}</p>
                {contact?.phone && <p className="text-sm text-gray-500">{contact.phone}</p>}
              </div>

              {/* Stage update */}
              <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Update Stage</h2>
                <div className="flex gap-3">
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value as EventSpaceStage | TalentStage)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                  >
                    {stageOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleStageUpdate}
                    disabled={stageSaving || selectedStage === inquiry.stage}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {stageSaving ? "Saving…" : stageSuccess ? "Saved ✓" : "Update"}
                  </button>
                </div>
              </div>

              {/* Type-specific fields */}
              <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  {inquiry.type === "event_space" ? "Event Details" : "Act Details"}
                </h2>
                {inquiry.type === "event_space" ? (
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    {inquiry.eventType && (
                      <>
                        <dt className="text-gray-500">Event Type</dt>
                        <dd className="text-gray-900 font-medium">{inquiry.eventType}</dd>
                      </>
                    )}
                    {inquiry.preferredDates && inquiry.preferredDates.length > 0 && (
                      <>
                        <dt className="text-gray-500">Preferred Date</dt>
                        <dd className="text-gray-900 font-medium">{inquiry.preferredDates.join(", ")}</dd>
                      </>
                    )}
                    {inquiry.estimatedGuestCount && (
                      <>
                        <dt className="text-gray-500">Guest Count</dt>
                        <dd className="text-gray-900 font-medium">~{inquiry.estimatedGuestCount}</dd>
                      </>
                    )}
                    {inquiry.budgetRange && (
                      <>
                        <dt className="text-gray-500">Budget</dt>
                        <dd className="text-gray-900 font-medium">{inquiry.budgetRange}</dd>
                      </>
                    )}
                  </dl>
                ) : (
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    {inquiry.artistName && (
                      <>
                        <dt className="text-gray-500">Artist / Act</dt>
                        <dd className="text-gray-900 font-medium">{inquiry.artistName}</dd>
                      </>
                    )}
                    {inquiry.genre && (
                      <>
                        <dt className="text-gray-500">Genre</dt>
                        <dd className="text-gray-900 font-medium">{inquiry.genre}</dd>
                      </>
                    )}
                    {inquiry.actType && (
                      <>
                        <dt className="text-gray-500">Act Type</dt>
                        <dd className="text-gray-900 font-medium capitalize">{inquiry.actType}</dd>
                      </>
                    )}
                    {inquiry.riderNotes && (
                      <>
                        <dt className="text-gray-500">Availability</dt>
                        <dd className="text-gray-900 font-medium">{inquiry.riderNotes}</dd>
                      </>
                    )}
                  </dl>
                )}
              </div>

              {/* Message */}
              <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Message</h2>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {inquiry.message || <span className="text-gray-400 italic">No message.</span>}
                </p>
              </div>
            </div>

            {/* Right: notes */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl px-5 py-5 flex flex-col gap-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Internal Notes
                </h2>

                {notes.length === 0 ? (
                  <p className="text-xs text-gray-400">No notes yet.</p>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="bg-gray-50 rounded-lg px-3 py-2.5">
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                          {note.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1.5">{formatTs(note.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={3}
                    placeholder="Add a note…"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={noteAdding || !noteText.trim()}
                    className="w-full py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {noteAdding ? "Adding…" : "Add Note"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
