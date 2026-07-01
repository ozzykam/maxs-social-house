"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/cmsService";
import type { MenuCategory } from "@maxs/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newVisible, setNewVisible] = useState(true);
  const [creating, setCreating] = useState(false);

  const [editName, setEditName] = useState("");
  const [editVisible, setEditVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setCategories(await listCategories());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await createCategory({ name: newName.trim(), sortOrder: categories.length, visible: newVisible });
      setNewName("");
      setNewVisible(true);
      await load();
    } finally { setCreating(false); }
  }

  async function move(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    const reordered = [...categories];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setMoving(true);
    try {
      // Write sequential sortOrders to all categories so duplicates can never interfere
      await Promise.all(reordered.map((cat, i) => updateCategory(cat.id, { sortOrder: i })));
      await load();
    } finally { setMoving(false); }
  }

  function startEdit(cat: MenuCategory) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditVisible(cat.visible);
  }

  async function handleSave(id: string) {
    setSaving(true);
    try {
      await updateCategory(id, { name: editName.trim(), visible: editVisible });
      setEditingId(null);
      await load();
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? Items in it will become uncategorized.")) return;
    await deleteCategory(id);
    await load();
  }

  return (
    <PermissionGate anyOf={["cms:menu"]}>
      <div className="max-w-xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/cms/menu" className="text-sm text-gray-500 hover:text-gray-700">
            ← Menu
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">Menu Categories</h1>
        </div>

        {/* Create form */}
        <form
          onSubmit={handleCreate}
          className="bg-white border border-gray-200 rounded-xl px-6 py-5 mb-6 flex items-center gap-3"
        >
          <input
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name…"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={newVisible}
              onChange={(e) => setNewVisible(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Visible</span>
          </label>
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors shrink-0"
          >
            {creating ? "Adding…" : "Add"}
          </button>
        </form>

        {/* Category list */}
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {categories.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-gray-400">No categories yet.</p>
            )}
            {categories.map((cat, index) => (
              <div key={cat.id} className="border-b border-gray-100 last:border-0">
                {editingId === cat.id ? (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-14 shrink-0" />
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={editVisible}
                        onChange={(e) => setEditVisible(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Visible</span>
                    </label>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleSave(cat.id)}
                        disabled={saving}
                        className="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center px-4 py-3 gap-3">
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        onClick={() => move(index, "up")}
                        disabled={moving || index === 0}
                        className="h-5 w-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-default transition-colors text-xs leading-none"
                        aria-label="Move up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => move(index, "down")}
                        disabled={moving || index === categories.length - 1}
                        className="h-5 w-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-default transition-colors text-xs leading-none"
                        aria-label="Move down"
                      >
                        ▼
                      </button>
                    </div>

                    <span className="flex-1 font-medium text-gray-900 text-sm">{cat.name}</span>

                    <span
                      className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        cat.visible ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {cat.visible ? "Visible" : "Hidden"}
                    </span>

                    <div className="flex gap-3 shrink-0">
                      <button
                        onClick={() => startEdit(cat)}
                        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-sm text-red-500 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
