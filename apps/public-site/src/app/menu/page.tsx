import { getMenu, getMediaUrls } from "@/lib/data";
import Image from "next/image";

export const revalidate = 1800;

export const metadata = {
  title: "Menu | Max's Social House",
};

const DIETARY_LABELS: Record<string, { label: string; className: string }> = {
  vegetarian: { label: "Vegetarian", className: "bg-green-900/50 text-green-300" },
  vegan: { label: "Vegan", className: "bg-emerald-900/50 text-emerald-300" },
  "gluten-free": { label: "GF", className: "bg-yellow-900/50 text-yellow-300" },
  spicy: { label: "Spicy", className: "bg-red-900/50 text-red-300" },
};

export default async function MenuPage() {
  const { categories, items } = await getMenu();
  const imageRefs = items.map((i) => i.imageRef).filter(Boolean) as string[];
  const mediaUrls = await getMediaUrls(imageRefs);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-14 text-center">
        <p className="text-amber-400 text-xs tracking-[0.25em] uppercase mb-3">Curated Daily</p>
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-white">Our Menu</h1>
      </div>

      {categories.length === 0 && (
        <p className="text-center text-neutral-500 py-24">Menu coming soon.</p>
      )}

      {categories.map((cat) => {
        const catItems = items.filter((i) => i.categoryId === cat.id);
        if (catItems.length === 0) return null;
        return (
          <section key={cat.id} className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="font-serif text-3xl font-semibold text-white shrink-0">{cat.name}</h2>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {catItems.map((item) => {
                const imgUrl = item.imageRef ? mediaUrls[item.imageRef] : null;
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 bg-neutral-900 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    {imgUrl ? (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                        <Image src={imgUrl} alt={item.name} fill className="object-cover" sizes="96px" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-neutral-800 rounded-lg shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-white text-sm leading-snug">{item.name}</h3>
                        <span className="text-amber-400 font-semibold text-sm shrink-0">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-neutral-400 text-xs mt-1.5 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      {item.dietaryTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.dietaryTags.map((tag) => {
                            const meta = DIETARY_LABELS[tag];
                            return meta ? (
                              <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${meta.className}`}>
                                {meta.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
