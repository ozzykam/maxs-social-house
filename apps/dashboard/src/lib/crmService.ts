import {
  collection, doc, getDocs, getDoc, updateDoc, addDoc, orderBy, query, where, documentId,
} from "firebase/firestore";
import { db } from "@maxs/services";
import type { Inquiry, Contact, InquiryNote, EventSpaceStage, TalentStage } from "@maxs/types";

type InquiryRow = Inquiry & { contactName?: string; contactEmail?: string };

export async function listInquiries(): Promise<InquiryRow[]> {
  const snap = await getDocs(query(collection(db, "inquiries"), orderBy("submittedAt", "desc")));
  const inquiries = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as InquiryRow);

  // Batch-fetch contacts for older docs that predate contactName denormalization
  const missingIds = [...new Set(
    inquiries.filter((inq) => !inq.contactName && inq.contactId).map((inq) => inq.contactId),
  )];

  if (missingIds.length === 0) return inquiries;

  const contactMap: Record<string, Contact> = {};
  for (let i = 0; i < missingIds.length; i += 30) {
    const chunk = missingIds.slice(i, i + 30);
    const cs = await getDocs(query(collection(db, "contacts"), where(documentId(), "in", chunk)));
    cs.docs.forEach((d) => { contactMap[d.id] = { id: d.id, ...d.data() } as Contact; });
  }

  return inquiries.map((inq) => {
    if (!inq.contactName && contactMap[inq.contactId]) {
      return {
        ...inq,
        contactName: contactMap[inq.contactId].name,
        contactEmail: inq.contactEmail ?? contactMap[inq.contactId].email,
      };
    }
    return inq;
  });
}

export async function getInquiryById(id: string): Promise<(Inquiry & { contactName?: string; contactEmail?: string }) | null> {
  const snap = await getDoc(doc(db, "inquiries", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Inquiry & { contactName?: string; contactEmail?: string };
}

export async function getContactById(id: string): Promise<Contact | null> {
  const snap = await getDoc(doc(db, "contacts", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Contact;
}

export async function updateInquiryStage(
  id: string,
  stage: EventSpaceStage | TalentStage,
  updatedBy: string
): Promise<void> {
  await updateDoc(doc(db, "inquiries", id), { stage, updatedAt: Date.now(), updatedBy });
}

export async function listInquiryNotes(inquiryId: string): Promise<InquiryNote[]> {
  const snap = await getDocs(
    query(collection(db, "inquiries", inquiryId, "notes"), orderBy("createdAt", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as InquiryNote);
}

export async function addInquiryNote(
  inquiryId: string,
  content: string,
  createdBy: string
): Promise<InquiryNote> {
  const ref = await addDoc(collection(db, "inquiries", inquiryId, "notes"), {
    content,
    createdBy,
    createdAt: Date.now(),
  });
  return { id: ref.id, content, createdBy, createdAt: Date.now() };
}
