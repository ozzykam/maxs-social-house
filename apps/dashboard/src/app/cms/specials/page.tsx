"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import { listSpecials, deleteSpecial } from "@/lib/cmsService";
import type { Special } from "@maxs/types";

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function SpecialsPage() {
  const [specials, setSpecials] = useState<Special[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setSpecials(await listSpecials());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this special?")) return;
    await deleteSpecial(id);
    await load();
  }

  return (
    <PermissionGate anyOf={["cms:specials"]}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/cms" className="text-sm text-gray-500 hover:text-gray-700">
              ← CMS
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">Specials & Promotions</h1>
          </div>
          <Link
            href="/cms/specials/new"
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            + Add Special
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : specials.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl px-8 py-12 text-center">
            <p className="text-sm text-gray-400">No specials yet. Add one to get started.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {specials.map((special) => (
              <div key={special.id} className="flex items-center px-6 py-4 border-b border-gray-100 last:border-0 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{special.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDate(special.startDate)} – {formatDate(special.endDate)}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${
                    special.published
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {special.published ? "Published" : "Draft"}
                </span>
                <div className="flex gap-3 shrink-0">
                  <Link
                    href={`/cms/specials/${special.id}`}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(special.id)}
                    className="text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
