// apps/public-site/src/lib/data.ts
// Read-side data access for the public site. These run on the server (in RSC /
// route handlers) and feed ISR-cached pages. See PHASE_1_SPEC.md Section 4.2
// for the rendering-strategy rationale (which pages are SSG vs ISR vs SSR).
import {
  collection, getDocs, query, where, orderBy, limit as fbLimit, documentId,
} from "firebase/firestore";
import { db } from "@maxs/services";
import type { PublicEvent, MenuItem, MenuCategory, Special, MediaItem } from "@maxs/types";

export async function getUpcomingEvents(max = 20): Promise<PublicEvent[]> {
  const now = Date.now();
  const q = query(
    collection(db, "events"),
    where("status", "in", ["published", "on_sale", "sold_out"]),
    where("date", ">=", now),
    orderBy("date", "asc"),
    fbLimit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PublicEvent);
}

export async function getActiveSpecials(): Promise<Special[]> {
  const now = Date.now();
  const q = query(
    collection(db, "specials"),
    where("published", "==", true),
    where("endDate", ">=", now),
    orderBy("endDate", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Special);
}

export async function getMenu(): Promise<{ categories: MenuCategory[]; items: MenuItem[] }> {
  const [categoriesSnap, itemsSnap] = await Promise.all([
    getDocs(query(collection(db, "menuCategories"), orderBy("sortOrder", "asc"))),
    getDocs(query(collection(db, "menu"), where("available", "==", true))),
  ]);
  const categories = categoriesSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as MenuCategory)
    .filter((c) => c.visible);
  const items = itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as MenuItem);
  return { categories, items };
}

export async function getFeaturedItems(): Promise<MenuItem[]> {
  const q = query(
    collection(db, "menu"),
    where("featured", "==", true),
    where("available", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MenuItem);
}

export async function getEventBySlug(slug: string): Promise<PublicEvent | null> {
  const q = query(collection(db, "events"), where("slug", "==", slug), fbLimit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as PublicEvent;
}

export async function getMediaUrls(ids: string[]): Promise<Record<string, string>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return {};
  const result: Record<string, string> = {};
  // Firestore `in` supports up to 30 values per query
  for (let i = 0; i < uniqueIds.length; i += 30) {
    const chunk = uniqueIds.slice(i, i + 30);
    const snap = await getDocs(
      query(collection(db, "media"), where(documentId(), "in", chunk))
    );
    snap.docs.forEach((d) => { result[d.id] = (d.data() as MediaItem).storageUrl; });
  }
  return result;
}
