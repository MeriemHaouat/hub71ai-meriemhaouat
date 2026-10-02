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
  scam: "#dc2626",
  rent: "#16a34a",
  landlord: "#2563eb",
  clinic: "#d97706",
  other: "#525252",
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

/** What GPT returns for one incoming message. */
export interface Extracted {
  type: ReportType;
  area: string;
  detail: string;
  lat?: number;
  lng?: number;
  reply: string;
}
