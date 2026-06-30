// packages/types/src/cms.ts
// Firestore document shapes for CMS-managed, public-facing content.
// See PHASE_1_SPEC.md Section 5 for collection paths and field rationale.

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  visible: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  dietaryTags: string[]; // "vegetarian", "gluten-free", "vegan", "spicy"
  imageRef: string | null; // Media document ID
  featured: boolean;
  available: boolean;
  availableSchedule?: {
    days: string[]; // "monday" | "tuesday" | ...
    timeStart: string; // "HH:mm"
    timeEnd: string;
  };
  createdBy: string;
  updatedBy: string;
  updatedAt: number;
}

export interface Special {
  id: string;
  title: string;
  description: string;
  imageRef: string | null;
  linkedMenuItemId?: string;
  startDate: number; // epoch millis
  endDate: number;
  published: boolean;
  createdBy: string;
  updatedAt: number;
}

export type EventStatus =
  | "draft"
  | "published"
  | "on_sale"
  | "sold_out"
  | "completed"
  | "cancelled";

export interface PublicEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  lineup: string[];
  date: number; // epoch millis, date of event
  startTime: string; // "HH:mm"
  endTime: string;
  imageRef: string | null;
  genreTags: string[];
  spacesUsed: string[]; // space IDs — feeds booking conflict detection
  performerIds: string[];
  ticketingEnabled: boolean;
  status: EventStatus;
  featured: boolean;
  createdBy: string;
  updatedAt: number;
}

export interface MediaItem {
  id: string;
  fileName: string;
  storageUrl: string;
  thumbnailUrl?: string;
  type: "image" | "video";
  tags: string[];
  altText: string;
  uploadedBy: string;
  uploadedAt: number;
}

export interface BusinessHoursDay {
  open: string; // "HH:mm"
  close: string;
  closed: boolean;
}

export interface BusinessHours {
  monday: BusinessHoursDay;
  tuesday: BusinessHoursDay;
  wednesday: BusinessHoursDay;
  thursday: BusinessHoursDay;
  friday: BusinessHoursDay;
  saturday: BusinessHoursDay;
  sunday: BusinessHoursDay;
  holidayOverrides: { date: string; note: string; closed: boolean }[];
}

export interface GeneralSettings {
  venueName: string;
  address: string;
  phone: string;
  email: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  aboutText: string; // markdown
}
