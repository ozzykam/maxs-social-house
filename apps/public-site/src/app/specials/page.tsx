import { getActiveSpecials, getMediaUrls } from "@/lib/data";
import Image from "next/image";

export const revalidate = 900;

export const metadata = {
  title: "Specials | Max's Social House",
};

export default async function SpecialsPage() {
  const specials = await getActiveSpecials();
  const imageRefs = specials.map((s) => s.imageRef).filter(Boolean) as string[];
  const mediaUrls = await getMediaUrls(imageRefs);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-14 text-center">
        <p className="text-amber-400 text-xs tracking-[0.25em] uppercase mb-3">Limited Time</p>
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-white">Current Specials</h1>
      </div>

      {specials.length === 0 ? (
        <p className="text-center text-neutral-500 py-24">No specials running right now — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {specials.map((special) => {
            const imgUrl = special.imageRef ? mediaUrls[special.imageRef] : null;
            return (
              <div
                key={special.id}
                className="bg-neutral-900 rounded-2xl overflow-hidden border border-white/5"
              >
                {imgUrl ? (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image src={imgUrl} alt={special.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-neutral-800" />
                )}
                <div className="p-6">
                  <h2 className="font-serif text-xl font-semibold text-white mb-2 leading-snug">
                    {special.title}
                  </h2>
                  <p className="text-neutral-400 text-sm leading-relaxed">{special.description}</p>
                  <p className="mt-4 text-xs text-neutral-600">
                    {new Date(special.startDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}
                    {" – "}
                    {new Date(special.endDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
