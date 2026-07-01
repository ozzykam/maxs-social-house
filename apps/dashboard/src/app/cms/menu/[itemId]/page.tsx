"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import { MediaPicker } from "@/components/MediaPicker";
import { AvailabilityScheduler, type ScheduleValue } from "@/components/AvailabilityScheduler";
import { getMenuItemById, listCategories, updateMenuItem, deleteMenuItem } from "@/lib/cmsService";
import { useAuth } from "@/lib/useAuth";
import type { MenuCategory } from "@maxs/types";

const DIETARY_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "gluten-free", label: "Gluten-Free" },
  { value: "vegan", label: "Vegan" },
  { value: "spicy", label: "Spicy" },
];

export default function EditMenuItemPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<MenuCategory[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [imageRef, setImageRef] = useState<string | null>(null);
  const [featured, setFeatured] = useState(false);
  const [available, setAvailable] = useState(true);
  const [schedule, setSchedule] = useState<ScheduleValue>({ days: [], timeStart: "09:00", timeEnd: "22:00" });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getMenuItemById(itemId), listCategories()]).then(([item, cats]) => {
      setCategories(cats);
      if (!item) { setError("Item not found."); setLoading(false); return; }
      setName(item.name);
      setDescription(item.description);
      setPrice(item.price.toFixed(2));
      setCategoryId(item.categoryId);
      setDietaryTags(item.dietaryTags);
      setImageRef(item.imageRef);
      setFeatured(item.featured);
      setAvailable(item.available);
      if (item.availableSchedule) {
        setSchedule(item.availableSchedule);
      }
      setLoading(false);
    }).catch(() => { setError("Failed to load item."); setLoading(false); });
  }, [itemId]);

  function toggleTag(tag: string) {
    setDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSaving(true);
    try {
      await updateMenuItem(
        itemId,
        {
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price),
          categoryId,
          dietaryTags,
          imageRef,
          featured,
          available,
          availableSchedule: schedule,
        },
        user.uid
      );
      router.push("/cms/menu");
    } catch {
      setError("Failed to save changes.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteMenuItem(itemId);
      router.push("/cms/menu");
    } catch {
      setError("Failed to delete item.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <PermissionGate anyOf={["cms:menu"]}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/cms/menu" className="text-sm text-gray-500 hover:text-gray-700">
            ← Menu
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">Edit Menu Item</h1>
        </div>

        {loading && <p className="text-sm text-gray-400">Loading…</p>}
        {error && !loading && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-xl px-8 py-8 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Tags</label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dietaryTags.includes(opt.value)}
                      onChange={() => toggleTag(opt.value)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <MediaPicker value={imageRef} onChange={setImageRef} />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Featured (shows on home page)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Available (published)</span>
              </label>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Availability Schedule</p>
              <AvailabilityScheduler value={schedule} onChange={setSchedule} />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3 pt-1">
              <Link
                href="/cms/menu"
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>

            <div className="pt-2 border-t border-gray-100">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  Delete this item
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">Are you sure?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? "Deleting…" : "Yes, delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </PermissionGate>
  );
}
