"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import { MediaPicker } from "@/components/MediaPicker";
import { getEventById, updateEvent, deleteEvent } from "@/lib/cmsService";
import { useAuth } from "@/lib/useAuth";
import type { EventStatus, EventCategory } from "@maxs/types";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function generateSlug(title: string, date: string): string {
  const titlePart = slugify(title);
  return date ? `${titlePart}-${date}` : titlePart;
}

function toDateInput(ms: number): string {
  return new Date(ms).toISOString().split("T")[0];
}
function fromDateInput(str: string): number {
  return new Date(str).getTime();
}

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "on_sale", label: "On Sale" },
  { value: "sold_out", label: "Sold Out" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: "live_music", label: "Live Music" },
  { value: "dj_night", label: "DJ Night" },
  { value: "line_dancing", label: "Line Dancing" },
  { value: "piano_dining", label: "Piano Dining" },
  { value: "open_mic", label: "Open Mic" },
  { value: "comedy", label: "Comedy" },
  { value: "trivia", label: "Trivia Night" },
  { value: "karaoke", label: "Karaoke" },
  { value: "tasting", label: "Tasting Event" },
  { value: "themed", label: "Themed Event" },
  { value: "block_party", label: "Block Party" },
  { value: "brunch", label: "Brunch" },
  { value: "other", label: "Other" },
];

function PillInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function add() {
    const val = input.trim();
    if (val && !values.includes(val)) onChange([...values, val]);
    setInput("");
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <button
          type="button"
          onClick={add}
          disabled={!input.trim()}
          className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors"
        >
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="text-gray-400 hover:text-gray-700 leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EditEventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("19:00");
  const [endTime, setEndTime] = useState("23:00");
  const [imageRef, setImageRef] = useState<string | null>(null);
  const [category, setCategory] = useState<EventCategory>("live_music");
  const [status, setStatus] = useState<EventStatus>("draft");
  const [featured, setFeatured] = useState(false);
  const [ticketingEnabled, setTicketingEnabled] = useState(false);
  const [lineup, setLineup] = useState<string[]>([]);
  const [genreTags, setGenreTags] = useState<string[]>([]);
  const [spacesUsed, setSpacesUsed] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getEventById(eventId).then((event) => {
      if (!event) { setError("Event not found."); setLoading(false); return; }
      setTitle(event.title);
      setSlug(event.slug);
      setDescription(event.description);
      setCategory(event.category ?? "live_music");
      setDate(toDateInput(event.date));
      setStartTime(event.startTime);
      setEndTime(event.endTime);
      setImageRef(event.imageRef);
      setStatus(event.status);
      setFeatured(event.featured);
      setTicketingEnabled(event.ticketingEnabled);
      setLineup(event.lineup);
      setGenreTags(event.genreTags);
      setSpacesUsed(event.spacesUsed);
      setSlugManual(true); // preserve existing slug by default; user can edit manually
      setLoading(false);
    }).catch(() => { setError("Failed to load event."); setLoading(false); });
  }, [eventId]);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugManual) setSlug(generateSlug(val, date));
  }

  function handleDateChange(val: string) {
    setDate(val);
    if (!slugManual) setSlug(generateSlug(title, val));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSaving(true);
    try {
      await updateEvent(
        eventId,
        {
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim(),
          category,
          date: fromDateInput(date),
          startTime,
          endTime,
          imageRef,
          status,
          featured,
          ticketingEnabled,
          lineup,
          genreTags,
          spacesUsed,
        },
        user.uid
      );
      router.push("/cms/events");
    } catch {
      setError("Failed to save changes.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteEvent(eventId);
      router.push("/cms/events");
    } catch {
      setError("Failed to delete event.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <PermissionGate anyOf={["cms:events"]}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/cms/events" className="text-sm text-gray-500 hover:text-gray-700">
            ← Events
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">Edit Event</h1>
        </div>

        {loading && <p className="text-sm text-gray-400">Loading…</p>}
        {error && !loading && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-xl px-8 py-8 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <input
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                URL Slug
                <span className="ml-2 text-xs text-gray-400 font-normal">/events/</span>
              </label>
              <input
                required
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">End</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <MediaPicker value={imageRef} onChange={setImageRef} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Featured on home page</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ticketingEnabled}
                  onChange={(e) => setTicketingEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  Enable Ticketing{" "}
                  <span className="text-gray-400 font-normal">(coming soon)</span>
                </span>
              </label>
            </div>

            <PillInput label="Lineup" values={lineup} onChange={setLineup} placeholder="Artist or performer name…" />
            <PillInput label="Genre Tags" values={genreTags} onChange={setGenreTags} placeholder="e.g. Jazz, Soul, R&B…" />
            <PillInput label="Spaces Used" values={spacesUsed} onChange={setSpacesUsed} placeholder="e.g. Main Hall, Rooftop…" />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3 pt-1">
              <Link
                href="/cms/events"
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>

            <div className="pt-2 border-t border-gray-100">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  Delete this event
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">Are you sure?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? "Deleting…" : "Yes, delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </PermissionGate>
  );
}
