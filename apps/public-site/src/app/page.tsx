import { getUpcomingEvents, getActiveSpecials } from "@/lib/data";

// Home page. ISR: regenerates at most once per 30 min. Content is editor-driven
// from the dashboard CMS, so we don't need per-request freshness here.
export const revalidate = 1800;

export default async function Home() {
  const [events, specials] = await Promise.all([
    getUpcomingEvents(4),
    getActiveSpecials(),
  ]);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Max&apos;s Social House</h1>
      <p>Upscale dining, private events, and live music.</p>

      <section style={{ marginTop: 24 }}>
        <h2>Upcoming Shows</h2>
        {events.length === 0 ? (
          <p>No upcoming events listed.</p>
        ) : (
          <ul>
            {events.map((e) => (
              <li key={e.id}>
                <a href={`/events/${e.slug}`}>{e.title}</a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>This Week&apos;s Specials</h2>
        {specials.length === 0 ? <p>Check back soon.</p> : (
          <ul>{specials.map((s) => <li key={s.id}>{s.title}</li>)}</ul>
        )}
      </section>
    </main>
  );
}
