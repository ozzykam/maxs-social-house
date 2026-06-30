// packages/types/src/crm.ts
// Firestore document shapes for CRM, inquiries, and contacts.
// See PHASE_1_SPEC.md Section 6 for collection paths and field rationale.

export type ContactType = "event_client" | "performer" | "general";
export type ContactSource =
  | "website_inquiry"
  | "referral"
  | "walk_in"
  | "phone"
  | "direct";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  type: ContactType;
  source: ContactSource;
  createdAt: number;
  lastContactedAt: number | null;
}

export type InquiryType = "event_space" | "talent";

export type EventSpaceStage =
  | "new"
  | "contacted"
  | "tour_scheduled"
  | "proposal_sent"
  | "contract_sent"
  | "booked"
  | "deposit_paid"
  | "completed"
  | "follow_up"
  | "lost";

export type TalentStage =
  | "new"
  | "in_discussion"
  | "confirmed"
  | "contracted"
  | "completed"
  | "declined";

export interface Inquiry {
  id: string;
  contactId: string;
  type: InquiryType;
  stage: EventSpaceStage | TalentStage;
  assignedTo: string | null; // userId

  // event_space-specific (present when type === "event_space")
  eventType?: string;
  estimatedGuestCount?: number;
  preferredDates?: string[];
  spacesInterested?: string[];
  budgetRange?: string;

  // talent-specific (present when type === "talent")
  artistName?: string;
  genre?: string;
  actType?: "solo" | "duo" | "band" | "dj";
  availabilityDates?: string[];
  riderNotes?: string;

  message: string;
  submittedAt: number;
  updatedAt: number;
}

export interface InquiryCommunication {
  id: string;
  channel: "email" | "phone" | "in_person" | "text" | "form_submission";
  summary: string;
  fullContent?: string;
  loggedBy: string; // userId
  timestamp: number;
}

export interface InquiryNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: number;
}
