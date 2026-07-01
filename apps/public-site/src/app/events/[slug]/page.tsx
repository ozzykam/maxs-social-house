import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getEventBySlug, getMediaUrls } from "@/lib/data";
import type { EventCategory } from "@maxs/types";

export const dynamic = "force-dynamic";

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

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${period}` : `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event Not Found | Max's Social House" };
  return {
    title: `${event.title} | Max's Social House`,
    description: event.description,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const mediaUrls = event.imageRef ? await getMediaUrls([event.imageRef]) : {};
  const imgUrl = event.imageRef ? mediaUrls[event.imageRef] : null;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[320px] overflow-hidden">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={event.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-6 pb-10">
          {event.genreTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {event.genreTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-neutral-300 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight">
            {event.title}
          </h1>
          <p className="text-neutral-300 mt-2 text-lg">
            {formattedDate} · {formatTime(event.startTime)}–{formatTime(event.endTime)}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/events"
          className="inline-block text-sm text-neutral-500 hover:text-white transition-colors mb-10"
        >
          ← All Events
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Main */}
          <div className="md:col-span-2 space-y-8">
            {event.description && (
              <div>
                <h2 className="font-serif text-2xl font-semibold text-white mb-4">About This Event</h2>
                <p className="text-neutral-400 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}

            {event.lineup.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-semibold text-white mb-4">Lineup</h2>
                <ul className="space-y-2">
                  {event.lineup.map((name) => (
                    <li key={name} className="flex items-center gap-3 text-neutral-300">
                      <span className="text-amber-400">★</span>
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6">
              <div className="space-y-4 text-sm">
                {event.category && (
                  <div>
                    <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Category</p>
                    <p className="text-amber-400 font-medium">
                      {CATEGORY_LABELS[event.category] ?? event.category}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Date</p>
                  <p className="text-white font-medium">{formattedDate}</p>
                </div>
                <div>
                  <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Time</p>
                  <p className="text-white font-medium">{formatTime(event.startTime)} – {formatTime(event.endTime)}</p>
                </div>
                {event.spacesUsed.length > 0 && (
                  <div>
                    <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Location</p>
                    <p className="text-white font-medium">{event.spacesUsed.join(", ")}</p>
                  </div>
                )}
              </div>

              {event.ticketingEnabled && (
                <div className="mt-6 pt-5 border-t border-white/5">
                  <p className="text-sm text-neutral-500 text-center">
                    Tickets coming soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
