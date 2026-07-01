"use server";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@maxs/services";

export async function submitPrivateEventInquiry(data: {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: string;
  message: string;
}) {
  const now = Date.now();
  const contactRef = await addDoc(collection(db, "contacts"), {
    name: data.name,
    email: data.email,
    phone: data.phone,
    type: "event_client",
    source: "website_inquiry",
    createdAt: now,
    lastContactedAt: null,
  });
  await addDoc(collection(db, "inquiries"), {
    contactId: contactRef.id,
    contactName: data.name,
    contactEmail: data.email,
    type: "event_space",
    stage: "new",
    assignedTo: null,
    eventType: data.eventType,
    estimatedGuestCount: data.guestCount ? parseInt(data.guestCount, 10) : undefined,
    preferredDates: data.eventDate ? [data.eventDate] : [],
    message: data.message,
    submittedAt: now,
    updatedAt: now,
  });
}

export async function submitTalentInquiry(data: {
  name: string;
  email: string;
  phone: string;
  actName: string;
  genre: string;
  availability: string;
  message: string;
}) {
  const now = Date.now();
  const contactRef = await addDoc(collection(db, "contacts"), {
    name: data.name,
    email: data.email,
    phone: data.phone,
    type: "performer",
    source: "website_inquiry",
    createdAt: now,
    lastContactedAt: null,
  });
  await addDoc(collection(db, "inquiries"), {
    contactId: contactRef.id,
    contactName: data.name,
    contactEmail: data.email,
    type: "talent",
    stage: "new",
    assignedTo: null,
    artistName: data.actName,
    genre: data.genre,
    riderNotes: data.availability,
    message: data.message,
    submittedAt: now,
    updatedAt: now,
  });
}
