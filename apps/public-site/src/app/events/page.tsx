import Link from "next/link";
import Image from "next/image";
import { getUpcomingEvents, getMediaUrls } from "@/lib/data";
import type { EventCategory } from "@maxs/types";

export const revalidate = 900;

export const metadata = {
  title: "Events | Max's Social House",
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

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${period}` : `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export default async function EventsPage() {
  const events = await getUpcomingEvents(50);
  const imageRefs = events.map((e) => e.imageRef).filter(Boolean) as string[];
  const mediaUrls = await getMediaUrls(imageRefs);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-14 text-center">
        <p className="text-amber-400 text-xs tracking-[0.25em] uppercase mb-3">Live Music & More</p>
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-white">Upcoming Events</h1>
      </div>

      {events.length === 0 ? (
        <p className="text-center text-neutral-500 py-24">
          No upcoming events scheduled — check back soon.
        </p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const imgUrl = event.imageRef ? mediaUrls[event.imageRef] : null;
            const eventDate = new Date(event.date);

            return (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="flex items-center gap-6 bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 hover:bg-neutral-800 transition-all group"
              >
                {/* Date block */}
                <div className="w-20 shrink-0 text-center py-5 pl-6 hidden sm:block">
                  <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
                    {eventDate.toLocaleDateString("en-US", { month: "short" })}
                  </p>
                  <p className="font-serif text-3xl font-bold text-white leading-none mt-0.5">
                    {eventDate.getDate()}
                  </p>
                  <p className="text-neutral-500 text-xs mt-0.5">
                    {eventDate.toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                </div>

                {/* Image */}
                {imgUrl ? (
                  <div className="relative w-28 h-20 shrink-0 overflow-hidden">
                    <Image
                      src={imgUrl}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="112px"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-20 shrink-0 bg-neutral-800" />
                )}

                {/* Details */}
                <div className="flex-1 min-w-0 py-4 pr-2">
                  <p className="font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                    {event.title}
                  </p>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {formatTime(event.startTime)}
                    {event.lineup.length > 0 && ` · ${event.lineup.slice(0, 2).join(", ")}`}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {event.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400">
                        {CATEGORY_LABELS[event.category] ?? event.category}
                      </span>
                    )}
                    {event.genreTags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-neutral-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pr-6 text-neutral-600 group-hover:text-amber-400 transition-colors text-xl shrink-0">
                  →
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
