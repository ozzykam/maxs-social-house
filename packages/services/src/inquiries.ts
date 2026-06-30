// packages/services/src/inquiries.ts
// Example shared service. Public inquiry submission goes through a Cloud Function
// (httpsCallable), never a direct client write — see PHASE_1_SPEC.md Section 4.4.
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebaseClient";
import type { InquiryType } from "@maxs/types";

export interface SubmitInquiryInput {
  type: InquiryType;
  name: string;
  email: string;
  phone: string;
  message: string;
  // event_space fields
  eventType?: string;
  estimatedGuestCount?: number;
  preferredDates?: string[];
  spacesInterested?: string[];
  budgetRange?: string;
  // talent fields
  artistName?: string;
  genre?: string;
  actType?: "solo" | "duo" | "band" | "dj";
  availabilityDates?: string[];
  riderNotes?: string;
}

export async function submitInquiry(input: SubmitInquiryInput): Promise<{ inquiryId: string }> {
  const functions = getFunctions(app);
  const callable = httpsCallable<SubmitInquiryInput, { inquiryId: string }>(
    functions,
    "submitInquiry"
  );
  const result = await callable(input);
  return result.data;
}
