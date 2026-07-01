"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import { MediaPicker } from "@/components/MediaPicker";
import { getSpecialById, listMenuItems, updateSpecial, deleteSpecial } from "@/lib/cmsService";
import { useAuth } from "@/lib/useAuth";
import type { MenuItem } from "@maxs/types";

function toDateInput(ms: number): string {
  return new Date(ms).toISOString().split("T")[0];
}
function fromDateInput(str: string): number {
  return new Date(str).getTime();
}

export default function EditSpecialPage() {
  const { specialId } = useParams<{ specialId: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageRef, setImageRef] = useState<string | null>(null);
  const [linkedMenuItemId, setLinkedMenuItemId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [published, setPublished] = useState(false);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getSpecialById(specialId), listMenuItems()]).then(([special, items]) => {
      setMenuItems(items);
      if (!special) { setError("Special not found."); setLoading(false); return; }
      setTitle(special.title);
      setDescription(special.description);
      setImageRef(special.imageRef);
      setLinkedMenuItemId(special.linkedMenuItemId ?? "");
      setStartDate(toDateInput(special.startDate));
      setEndDate(toDateInput(special.endDate));
      setPublished(special.published);
      setLoading(false);
    }).catch(() => { setError("Failed to load special."); setLoading(false); });
  }, [specialId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSaving(true);
    try {
      await updateSpecial(
        specialId,
        {
          title: title.trim(),
          description: description.trim(),
          imageRef,
          linkedMenuItemId: linkedMenuItemId || null,
          startDate: fromDateInput(startDate),
          endDate: fromDateInput(endDate),
          published,
        },
        user.uid
      );
      router.push("/cms/specials");
    } catch {
      setError("Failed to save changes.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteSpecial(specialId);
      router.push("/cms/specials");
    } catch {
      setError("Failed to delete special.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <PermissionGate anyOf={["cms:specials"]}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/cms/specials" className="text-sm text-gray-500 hover:text-gray-700">
            ← Specials
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">Edit Special</h1>
        </div>

        {loading && <p className="text-sm text-gray-400">Loading…</p>}
        {error && !loading && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-xl px-8 py-8 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <MediaPicker value={imageRef} onChange={setImageRef} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Linked Menu Item <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                value={linkedMenuItemId}
                onChange={(e) => setLinkedMenuItemId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              >
                <option value="">— None —</option>
                {menuItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Published</span>
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3 pt-1">
              <Link
                href="/cms/specials"
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
                  Delete this special
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
