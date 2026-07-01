import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  orderBy,
  query,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
} from "firebase/storage";
import { db, storage } from "@maxs/services";
import type { MediaItem } from "@maxs/types";

export async function listMedia(): Promise<MediaItem[]> {
  const q = query(collection(db, "media"), orderBy("uploadedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MediaItem);
}

export function startUpload(file: File, storagePath: string): UploadTask {
  return uploadBytesResumable(ref(storage, storagePath), file, {
    contentType: file.type,
  });
}

export async function finalizeUpload({
  storagePath,
  fileName,
  type,
  altText,
  tags,
  uploadedBy,
}: {
  storagePath: string;
  fileName: string;
  type: "image" | "video";
  altText: string;
  tags: string[];
  uploadedBy: string;
}): Promise<MediaItem> {
  const storageUrl = await getDownloadURL(ref(storage, storagePath));
  const docRef = doc(collection(db, "media"));
  const item: Omit<MediaItem, "id"> = {
    fileName,
    storagePath,
    storageUrl,
    type,
    tags,
    altText,
    uploadedBy,
    uploadedAt: Date.now(),
  };
  await setDoc(docRef, item);
  return { id: docRef.id, ...item };
}

export async function deleteMedia(id: string, storagePath: string): Promise<void> {
  await deleteObject(ref(storage, storagePath));
  await deleteDoc(doc(db, "media", id));
}
