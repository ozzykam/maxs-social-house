import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@maxs/services";
import type { MenuCategory, MenuItem, Special, PublicEvent } from "@maxs/types";

// ---- Menu Categories ----

export async function listCategories(): Promise<MenuCategory[]> {
  const q = query(collection(db, "menuCategories"), orderBy("sortOrder", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MenuCategory);
}

export async function createCategory(data: {
  name: string;
  sortOrder: number;
  visible: boolean;
}): Promise<string> {
  const ref = doc(collection(db, "menuCategories"));
  await setDoc(ref, { ...data });
  return ref.id;
}

export async function updateCategory(
  id: string,
  data: Partial<Pick<MenuCategory, "name" | "sortOrder" | "visible">>
): Promise<void> {
  await updateDoc(doc(db, "menuCategories", id), data);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, "menuCategories", id));
}

// ---- Menu Items ----

export async function listMenuItems(): Promise<MenuItem[]> {
  const q = query(collection(db, "menu"), orderBy("categoryId"), orderBy("name"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MenuItem);
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const snap = await getDoc(doc(db, "menu", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as MenuItem) : null;
}

export async function createMenuItem(
  data: Omit<MenuItem, "id" | "createdBy" | "updatedBy" | "updatedAt">,
  createdBy: string
): Promise<string> {
  const ref = doc(collection(db, "menu"));
  await setDoc(ref, {
    ...data,
    createdBy,
    updatedBy: createdBy,
    updatedAt: Date.now(),
  });
  return ref.id;
}

export async function updateMenuItem(
  id: string,
  data: Partial<Omit<MenuItem, "id" | "createdBy" | "updatedBy" | "updatedAt">> & {
    availableSchedule?: MenuItem["availableSchedule"] | null;
  },
  updatedBy: string
): Promise<void> {
  const { availableSchedule, ...rest } = data;
  await updateDoc(doc(db, "menu", id), {
    ...rest,
    // null = explicitly remove the field; undefined = leave it untouched
    ...(availableSchedule === null
      ? { availableSchedule: deleteField() }
      : availableSchedule !== undefined
      ? { availableSchedule }
      : {}),
    updatedBy,
    updatedAt: Date.now(),
  });
}

export async function deleteMenuItem(id: string): Promise<void> {
  await deleteDoc(doc(db, "menu", id));
}

// ---- Specials ----

export async function listSpecials(): Promise<Special[]> {
  const q = query(collection(db, "specials"), orderBy("startDate", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Special);
}

export async function getSpecialById(id: string): Promise<Special | null> {
  const snap = await getDoc(doc(db, "specials", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Special) : null;
}

export async function createSpecial(
  data: Omit<Special, "id" | "createdBy" | "updatedBy" | "updatedAt">,
  createdBy: string
): Promise<string> {
  const ref = doc(collection(db, "specials"));
  await setDoc(ref, {
    ...data,
    createdBy,
    updatedBy: createdBy,
    updatedAt: Date.now(),
  });
  return ref.id;
}

export async function updateSpecial(
  id: string,
  data: Partial<Omit<Special, "id" | "createdBy" | "updatedBy" | "updatedAt">>,
  updatedBy: string
): Promise<void> {
  await updateDoc(doc(db, "specials", id), {
    ...data,
    updatedBy,
    updatedAt: Date.now(),
  });
}

export async function deleteSpecial(id: string): Promise<void> {
  await deleteDoc(doc(db, "specials", id));
}

// ---- Events ----

export async function listEvents(): Promise<PublicEvent[]> {
  const q = query(collection(db, "events"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PublicEvent);
}

export async function getEventById(id: string): Promise<PublicEvent | null> {
  const snap = await getDoc(doc(db, "events", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as PublicEvent) : null;
}

export async function createEvent(
  data: Omit<PublicEvent, "id" | "createdBy" | "updatedBy" | "updatedAt">,
  createdBy: string
): Promise<string> {
  const ref = doc(collection(db, "events"));
  await setDoc(ref, {
    ...data,
    createdBy,
    updatedBy: createdBy,
    updatedAt: Date.now(),
  });
  return ref.id;
}

export async function updateEvent(
  id: string,
  data: Partial<Omit<PublicEvent, "id" | "createdBy" | "updatedBy" | "updatedAt">>,
  updatedBy: string
): Promise<void> {
  await updateDoc(doc(db, "events", id), {
    ...data,
    updatedBy,
    updatedAt: Date.now(),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, "events", id));
}
