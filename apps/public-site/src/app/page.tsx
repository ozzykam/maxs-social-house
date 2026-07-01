import Link from "next/link";
import Image from "next/image";
import { getUpcomingEvents, getActiveSpecials, getFeaturedItems, getMediaUrls } from "@/lib/data";

export const revalidate = 1800;

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${period}` : `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export default async function Home() {
  const [events, specials, featured] = await Promise.all([
    getUpcomingEvents(4),
    getActiveSpecials(),
    getFeaturedItems(),
  ]);

  const imageRefs = [
    ...specials.map((s) => s.imageRef),
    ...featured.map((i) => i.imageRef),
    ...events.map((e) => e.imageRef),
  ].filter(Boolean) as string[];
  const mediaUrls = await getMediaUrls(imageRefs);

  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-[85vh] text-center px-6 overflow-hidden">
        <Image
          src="/images/maxs-background-blue.webp"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-3xl mx-auto">
           <p className="text-amber-400 text-xs tracking-[0.35em] uppercase mb-6
">Welcome to</p>
          <Image
            src="/images/maxs-logo-with-sub.webp"
            alt="Max's Social House — Dining · Entertainment · Events"
            width={540}
            height={640}
            priority
            className="mx-auto mb-10 w-auto max-w-[280px] md:max-w-sm lg:max-w-md"
          />
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/menu"
              className="px-8 py-3.5 bg-amber-400 text-neutral-950 text-sm font-semibold rounded-full hover:bg-amber-300 transition-colors"
            >
              View Menu
            </Link>
            <Link
              href="/events"
              className="px-8 py-3.5 border border-white/20 text-white text-sm font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              Upcoming Events
            </Link>
            <Link
              href="/private-events"
              className="px-8 py-3.5 border border-white/20 text-white text-sm font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              Book a Private Event
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-amber-400 text-xs tracking-[0.25em] uppercase mb-2">From the Kitchen</p>
              <h2 className="font-serif text-4xl font-bold text-white">Featured Dishes</h2>
            </div>
            <Link href="/menu" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Full Menu →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0, 4).map((item) => {
              const imgUrl = item.imageRef ? mediaUrls[item.imageRef] : null;
              return (
                <div key={item.id} className="bg-neutral-900 rounded-2xl overflow-hidden border border-white/5 group">
                  {imgUrl ? (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={imgUrl}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-neutral-800" />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-white text-sm mb-1">{item.name}</h3>
                    {item.description && (
                      <p className="text-neutral-500 text-xs line-clamp-2 mb-2">{item.description}</p>
                    )}
                    <p className="text-amber-400 font-semibold text-sm">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Specials */}
      {specials.length > 0 && (
        <section className="bg-neutral-900 py-20 border-y border-white/5">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-amber-400 text-xs tracking-[0.25em] uppercase mb-2">Limited Time</p>
                <h2 className="font-serif text-4xl font-bold text-white">Current Specials</h2>
              </div>
              <Link href="/specials" className="text-sm text-neutral-400 hover:text-white transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specials.slice(0, 3).map((special) => {
                const imgUrl = special.imageRef ? mediaUrls[special.imageRef] : null;
                return (
                  <div key={special.id} className="bg-neutral-800 rounded-2xl overflow-hidden border border-white/5">
                    {imgUrl ? (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={imgUrl}
                          alt={special.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-neutral-700" />
                    )}
                    <div className="p-5">
                      <h3 className="font-serif text-xl font-semibold text-white mb-2">
                        {special.title}
                      </h3>
                      <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3">
                        {special.description}
                      </p>
                      <p className="mt-3 text-xs text-neutral-600">
                        Through{" "}
                        {new Date(special.endDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-amber-400 text-xs tracking-[0.25em] uppercase mb-2">Live Music & More</p>
              <h2 className="font-serif text-4xl font-bold text-white">Upcoming Events</h2>
            </div>
            <Link href="/events" className="text-sm text-neutral-400 hover:text-white transition-colors">
              All events →
            </Link>
          </div>
          <div className="space-y-3">
            {events.map((e) => {
              const imgUrl = e.imageRef ? mediaUrls[e.imageRef] : null;
              return (
                <Link
                  key={e.id}
                  href={`/events/${e.slug}`}
                  className="flex items-center gap-4 bg-neutral-900 border border-white/5 rounded-xl overflow-hidden hover:bg-neutral-800 hover:border-white/10 transition-all group"
                >
                  {imgUrl ? (
                    <div className="relative ml-2 rounded-md w-20 h-16 shrink-0 overflow-hidden">
                      <Image
                        src={imgUrl}
                        alt={e.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="80px"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-16 shrink-0 bg-neutral-800" />
                  )}
                  <div className="flex-1 min-w-0 py-4">
                    <p className="font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                      {e.title}
                    </p>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      {new Date(e.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                      {" · "}
                      {formatTime(e.startTime)}
                    </p>
                  </div>
                  <span className="text-neutral-600 group-hover:text-amber-400 transition-colors text-xl pr-5 shrink-0">→</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Private Events CTA */}
      <section className="bg-neutral-900 border-t border-white/5 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-amber-400 text-xs tracking-[0.25em] uppercase mb-4">Celebrate With Us</p>
          <h2 className="font-serif text-4xl font-bold text-white mb-4">Host Your Private Event</h2>
          <p className="text-neutral-400 mb-8 leading-relaxed">
            From intimate dinners to large celebrations, our versatile spaces and dedicated team
            make every event unforgettable.
          </p>
          <Link
            href="/private-events/inquire"
            className="inline-block px-10 py-4 bg-amber-400 text-neutral-950 text-sm font-semibold rounded-full hover:bg-amber-300 transition-colors"
          >
            Inquire About a Private Event
          </Link>
        </div>
      </section>
    </>
  );
}
