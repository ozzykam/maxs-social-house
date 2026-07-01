import Link from "next/link";

export const metadata = {
  title: "Private Events | Max's Social House",
};

export default function PrivateEventsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-center">
      <p className="text-amber-400 text-xs tracking-[0.25em] uppercase mb-4">Host Your Event</p>
      <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6">Private Events</h1>
      <p className="text-neutral-400 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
        From intimate dinners to large celebrations, Max&apos;s Social House offers versatile spaces
        and a dedicated events team to make every occasion unforgettable.
      </p>
      <Link
        href="/private-events/inquire"
        className="inline-block px-10 py-4 bg-amber-400 text-neutral-950 text-sm font-semibold rounded-full hover:bg-amber-300 transition-colors"
      >
        Submit an Inquiry
      </Link>
    </div>
  );
}
