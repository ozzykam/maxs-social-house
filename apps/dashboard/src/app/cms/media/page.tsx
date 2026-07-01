"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import { listMedia, startUpload, finalizeUpload, deleteMedia } from "@/lib/mediaService";
import { useAuth } from "@/lib/useAuth";
import type { MediaItem } from "@maxs/types";

interface UploadState {
  file: File;
  progress: number;
  altText: string;
  error: string;
}

export default function MediaLibraryPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setItems(await listMedia());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const newUploads = files.map((f) => ({ file: f, progress: 0, altText: "", error: "" }));
    setUploads((prev) => [...prev, ...newUploads]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function updateAltText(index: number, altText: string) {
    setUploads((prev) => prev.map((u, i) => (i === index ? { ...u, altText } : u)));
  }

  async function handleUpload(index: number) {
    if (!user) return;
    const upload = uploads[index];
    const storagePath = `media/${Date.now()}_${upload.file.name}`;
    const type = upload.file.type.startsWith("video/") ? "video" : "image";

    const task = startUpload(upload.file, storagePath);

    task.on(
      "state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setUploads((prev) => prev.map((u, i) => (i === index ? { ...u, progress: pct } : u)));
      },
      () => {
        setUploads((prev) =>
          prev.map((u, i) =>
            i === index ? { ...u, error: "Upload failed. Try again." } : u
          )
        );
      },
      async () => {
        try {
          await finalizeUpload({
            storagePath,
            fileName: upload.file.name,
            type,
            altText: upload.altText.trim() || upload.file.name,
            tags: [],
            uploadedBy: user.uid,
          });
          setUploads((prev) => prev.filter((_, i) => i !== index));
          await load();
        } catch {
          setUploads((prev) =>
            prev.map((u, i) =>
              i === index ? { ...u, error: "Failed to save. Try again." } : u
            )
          );
        }
      }
    );
  }

  async function handleDelete(item: MediaItem) {
    try {
      await deleteMedia(item.id, item.storagePath);
      setConfirmDeleteId(null);
      await load();
    } catch {
      // Surface error inline if needed
    }
  }

  return (
    <PermissionGate anyOf={["cms:media"]}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/cms" className="text-sm text-gray-500 hover:text-gray-700">
              ← CMS
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">Media Library</h1>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Upload queue */}
        {uploads.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 mb-6">
            {uploads.map((upload, i) => (
              <div key={i} className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                    {upload.file.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => setUploads((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Alt text</label>
                    <input
                      value={upload.altText}
                      onChange={(e) => updateAltText(i, e.target.value)}
                      placeholder={upload.file.name}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpload(i)}
                    disabled={upload.progress > 0 && upload.progress < 100}
                    className="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {upload.progress > 0 && upload.progress < 100
                      ? `${upload.progress}%`
                      : "Upload"}
                  </button>
                </div>
                {upload.error && (
                  <p className="text-xs text-red-600">{upload.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Media grid */}
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl px-6 py-12 text-center">
            <p className="text-gray-400 text-sm">No media uploaded yet.</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-sm text-gray-900 font-medium underline"
            >
              Upload your first file
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative bg-gray-100 rounded-xl overflow-hidden aspect-square"
              >
                {item.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.storageUrl}
                    alt={item.altText}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">
                    video
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100">
                  <p className="text-white text-xs truncate mb-1">{item.altText || item.fileName}</p>
                  {confirmDeleteId === item.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(item)}
                        className="flex-1 text-xs bg-red-600 text-white rounded px-2 py-1"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="flex-1 text-xs bg-white/20 text-white rounded px-2 py-1"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="text-xs bg-white/20 text-white rounded px-2 py-1 hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
