import Link from "next/link";

export const metadata = {
  title: "Perform at Max's | Max's Social House",
};

export default function TalentPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-center">
      <p className="text-amber-400 text-xs tracking-[0.25em] uppercase mb-4">Join Our Lineup</p>
      <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6">Perform at Max&apos;s</h1>
      <p className="text-neutral-400 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
        Max&apos;s Social House is always looking for talented artists, musicians, DJs, and entertainers
        to bring unforgettable experiences to our guests. Submit an inquiry to get on our radar.
      </p>
      <Link
        href="/talent/inquire"
        className="inline-block px-10 py-4 bg-amber-400 text-neutral-950 text-sm font-semibold rounded-full hover:bg-amber-300 transition-colors"
      >
        Submit a Booking Inquiry
      </Link>
    </div>
  );
}
