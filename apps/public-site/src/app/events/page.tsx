import { getUpcomingEvents } from "@/lib/data";

// Events calendar listing. ISR every 15 min — fresh enough for a public calendar
// without rebuilding on every dashboard edit.
export const revalidate = 900;

export default async function EventsPage() {
  const events = await getUpcomingEvents(50);
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Events &amp; Live Music</h1>
      <ul>
        {events.map((e) => (
          <li key={e.id}>
            <a href={`/events/${e.slug}`}>
              {new Date(e.date).toLocaleDateString()} — {e.title}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
