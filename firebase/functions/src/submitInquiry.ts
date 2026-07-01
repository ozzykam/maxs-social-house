import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import type { InquiryType } from "@maxs/types";

interface SubmitInquiryData {
  type: InquiryType;
  name: string;
  email: string;
  phone: string;
  message: string;
  eventType?: string;
  estimatedGuestCount?: number;
  preferredDates?: string[];
  spacesInterested?: string[];
  budgetRange?: string;
  artistName?: string;
  genre?: string;
  actType?: "solo" | "duo" | "band" | "dj";
  availabilityDates?: string[];
  riderNotes?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const submitInquiry = onCall<SubmitInquiryData>(
  { enforceAppCheck: false /* TODO: enable App Check before launch (spec §11) */ },
  async (request) => {
    if (!admin.apps.length) admin.initializeApp();

    const d = request.data;

    if (!d || (d.type !== "event_space" && d.type !== "talent")) {
      throw new HttpsError("invalid-argument", "Invalid inquiry type.");
    }
    if (!d.name?.trim() || !isValidEmail(d.email ?? "")) {
      throw new HttpsError("invalid-argument", "Name and a valid email are required.");
    }
    if ((d.message?.length ?? 0) > 5000) {
      throw new HttpsError("invalid-argument", "Message too long.");
    }

    const db = admin.firestore();
    const now = Date.now();

    const existing = await db
      .collection("contacts")
      .where("email", "==", d.email.toLowerCase())
      .limit(1)
      .get();

    let contactId: string;
    if (!existing.empty) {
      contactId = existing.docs[0].id;
      await existing.docs[0].ref.update({ lastContactedAt: now });
    } else {
      const contactRef = db.collection("contacts").doc();
      contactId = contactRef.id;
      await contactRef.set({
        name: d.name.trim(),
        email: d.email.toLowerCase(),
        phone: d.phone ?? "",
        type: d.type === "talent" ? "performer" : "event_client",
        source: "website_inquiry",
        createdAt: now,
        lastContactedAt: now,
      });
    }

    const inquiryRef = db.collection("inquiries").doc();
    await inquiryRef.set({
      contactId,
      type: d.type,
      stage: "new",
      assignedTo: null,
      eventType: d.eventType ?? null,
      estimatedGuestCount: d.estimatedGuestCount ?? null,
      preferredDates: d.preferredDates ?? null,
      spacesInterested: d.spacesInterested ?? null,
      budgetRange: d.budgetRange ?? null,
      artistName: d.artistName ?? null,
      genre: d.genre ?? null,
      actType: d.actType ?? null,
      availabilityDates: d.availabilityDates ?? null,
      riderNotes: d.riderNotes ?? null,
      message: d.message ?? "",
      submittedAt: now,
      updatedAt: now,
    });

    await inquiryRef.collection("communications").doc().set({
      channel: "form_submission",
      summary: `New ${d.type} inquiry via website`,
      fullContent: d.message ?? "",
      loggedBy: "system",
      timestamp: now,
    });

    // TODO (spec §9): trigger notification email/Slack to the owning manager.

    return { inquiryId: inquiryRef.id };
  }
);
