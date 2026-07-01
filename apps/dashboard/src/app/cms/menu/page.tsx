"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import { listMenuItems, listCategories } from "@/lib/cmsService";
import type { MenuItem, MenuCategory } from "@maxs/types";

const DIETARY_LABELS: Record<string, string> = {
  vegetarian: "Veg",
  "gluten-free": "GF",
  vegan: "VGN",
  spicy: "🌶",
};

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listMenuItems(), listCategories()])
      .then(([its, cats]) => { setItems(its); setCategories(cats); })
      .finally(() => setLoading(false));
  }, []);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  // Group items by category
  const grouped = categories.map((cat) => ({
    category: cat,
    items: items.filter((i) => i.categoryId === cat.id),
  }));
  const uncategorized = items.filter(
    (i) => !categories.some((c) => c.id === i.categoryId)
  );

  return (
    <PermissionGate anyOf={["cms:menu"]}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/cms" className="text-sm text-gray-500 hover:text-gray-700">
              ← CMS
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">Menu</h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/cms/menu/categories"
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Manage Categories
            </Link>
            <Link
              href="/cms/menu/new"
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add Item
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl px-6 py-12 text-center">
            <p className="text-gray-400 text-sm">No menu items yet.</p>
            <Link
              href="/cms/menu/new"
              className="inline-block mt-3 text-sm text-gray-900 font-medium underline"
            >
              Add the first item
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ category, items: catItems }) =>
              catItems.length === 0 ? null : (
                <section key={category.id}>
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {category.name}
                  </h2>
                  <MenuItemTable items={catItems} categoryMap={categoryMap} />
                </section>
              )
            )}
            {uncategorized.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Uncategorized
                </h2>
                <MenuItemTable items={uncategorized} categoryMap={categoryMap} />
              </section>
            )}
          </div>
        )}
      </div>
    </PermissionGate>
  );
}

function MenuItemTable({
  items,
  categoryMap,
}: {
  items: MenuItem[];
  categoryMap: Record<string, string>;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden text-sm">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-2.5 font-medium text-gray-600">Item</th>
            <th className="text-left px-4 py-2.5 font-medium text-gray-600">Price</th>
            <th className="text-left px-4 py-2.5 font-medium text-gray-600">Category</th>
            <th className="text-left px-4 py-2.5 font-medium text-gray-600">Tags</th>
            <th className="text-left px-4 py-2.5 font-medium text-gray-600">Status</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{item.name}</p>
                {item.featured && (
                  <span className="text-xs text-amber-600">★ Featured</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-700">
                ${item.price.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {categoryMap[item.categoryId] ?? "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {item.dietaryTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                    >
                      {DIETARY_LABELS[tag] ?? tag}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    item.available
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {item.available ? "Available" : "Unavailable"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/cms/menu/${item.id}`}
                  className="text-gray-500 hover:text-gray-900 font-medium"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
