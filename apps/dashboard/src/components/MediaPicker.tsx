"use client";
import { useEffect, useState } from "react";
import { listMedia } from "@/lib/mediaService";
import type { MediaItem } from "@maxs/types";

interface Props {
  value: string | null;
  onChange: (id: string | null) => void;
}

export function MediaPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  // Keep the preview in sync with the value prop
  useEffect(() => {
    if (!value) { setSelected(null); return; }
    if (selected?.id === value) return;
    // If the media item is already loaded, find it; otherwise fetch lazily
    const found = items.find((m) => m.id === value);
    if (found) setSelected(found);
  }, [value, items, selected?.id]);

  async function openModal() {
    setOpen(true);
    setLoading(true);
    try {
      const data = await listMedia();
      setItems(data);
      setSelected(data.find((m) => m.id === value) ?? null);
    } finally {
      setLoading(false);
    }
  }

  function pick(item: MediaItem) {
    setSelected(item);
    onChange(item.id);
    setOpen(false);
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {selected ? (
          <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            {selected.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.storageUrl}
                alt={selected.altText}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-400">
                video
              </div>
            )}
          </div>
        ) : null}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openModal}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {selected ? "Change image" : "Choose image"}
          </button>
          {selected && (
            <button
              type="button"
              onClick={() => { setSelected(null); onChange(null); }}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Media Library</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading && <p className="text-sm text-gray-400">Loading…</p>}
              {!loading && items.length === 0 && (
                <p className="text-sm text-gray-400">
                  No media uploaded yet. Go to CMS → Media Library to upload files.
                </p>
              )}
              {!loading && items.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => pick(item)}
                      className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                        item.id === value
                          ? "border-gray-900"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      {item.type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.storageUrl}
                          alt={item.altText}
                          className="h-full w-full object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-100 text-xs text-gray-400">
                          video
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-black/50 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs truncate">{item.fileName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
