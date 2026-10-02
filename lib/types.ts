export type ReportType = "scam" | "rent" | "landlord" | "clinic" | "other";

export const REPORT_TYPES: ReportType[] = [
  "scam",
  "rent",
  "landlord",
  "clinic",
  "other",
];

export const TYPE_LABELS: Record<ReportType, string> = {
  scam: "Scam",
  rent: "Rent",
  landlord: "Landlord",
  clinic: "Clinic / service",
  other: "Tip",
};

export const TYPE_COLORS: Record<ReportType, string> = {
  scam: "#DC2626",
  rent: "#16A34A",
  landlord: "#0D8FB8",
  clinic: "#F59E0B",
  other: "#5B616A",
};

export interface Report {
  id: string;
  type: ReportType;
  area: string;
  detail: string;
  lat: number;
  lng: number;
  source: string;
  created_at: string;
}

/** A community contribution extracted from a message. */
export interface Extracted {
  type: ReportType;
  area: string;
  detail: string;
  lat?: number;
  lng?: number;
  reply: string;
}

/** One prior turn in a WhatsApp conversation (for Rafiki's memory). */
export interface Turn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Rafiki's decision for one incoming message:
 * - "answer"  → a question/help request; reply only, nothing saved.
 * - "listing" → a genuine community contribution; save it + reply.
 */
export interface BrainResult {
  kind: "answer" | "listing";
  reply: string;
  listing?: Extracted;
}
