"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import { listEvents, deleteEvent } from "@/lib/cmsService";
import type { PublicEvent, EventStatus, EventCategory } from "@maxs/types";

const STATUS_STYLES: Record<EventStatus, string> = {
  draft: "bg-gray-100 text-gray-500",
  published: "bg-green-50 text-green-700",
  on_sale: "bg-blue-50 text-blue-700",
  sold_out: "bg-orange-50 text-orange-700",
  completed: "bg-neutral-100 text-neutral-500",
  cancelled: "bg-red-50 text-red-600",
};

const STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Draft",
  published: "Published",
  on_sale: "On Sale",
  sold_out: "Sold Out",
  completed: "Completed",
  cancelled: "Cancelled",
};

const CATEGORY_LABELS: Record<EventCategory, string> = {
  live_music: "Live Music",
  dj_night: "DJ Night",
  line_dancing: "Line Dancing",
  piano_dining: "Piano Dining",
  open_mic: "Open Mic",
  comedy: "Comedy",
  trivia: "Trivia Night",
  karaoke: "Karaoke",
  tasting: "Tasting",
  themed: "Themed",
  block_party: "Block Party",
  brunch: "Brunch",
  other: "Other",
};

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EventsListPage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setEvents(await listEvents());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    await deleteEvent(id);
    await load();
  }

  return (
    <PermissionGate anyOf={["cms:events"]}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/cms" className="text-sm text-gray-500 hover:text-gray-700">
              ← CMS
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">Events</h1>
          </div>
          <Link
            href="/cms/events/new"
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            + Add Event
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : events.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl px-8 py-12 text-center">
            <p className="text-sm text-gray-400">No events yet. Add one to get started.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center px-6 py-4 border-b border-gray-100 last:border-0 gap-4"
              >
                <div className="w-24 shrink-0">
                  <p className="text-xs font-medium text-gray-500">{formatDate(event.date)}</p>
                  <p className="text-xs text-gray-400">{event.startTime}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{event.title}</p>
                  {event.genreTags.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {event.genreTags.join(" · ")}
                    </p>
                  )}
                </div>
                {event.category && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 shrink-0">
                    {CATEGORY_LABELS[event.category] ?? event.category}
                  </span>
                )}
                {event.featured && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 shrink-0">
                    Featured
                  </span>
                )}
                <span
                  className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[event.status]}`}
                >
                  {STATUS_LABELS[event.status]}
                </span>
                <div className="flex gap-3 shrink-0">
                  <Link
                    href={`/cms/events/${event.id}`}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
