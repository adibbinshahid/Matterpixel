import { z } from "zod";

export const BUDGET_OPTIONS = [
  "Under $5k",
  "$5k – $15k",
  "$15k – $40k",
  "$40k+",
  "Not sure yet",
] as const;

export const TIMELINE_OPTIONS = ["ASAP", "1–3 months", "3–6 months", "Flexible"] as const;

export const inquirySchema = z.object({
  fullName: z.string().trim().min(2, "Tell us your name.").max(100),
  workEmail: z.string().trim().email("Enter a valid email."),
  company: z.string().trim().max(200).optional(),
  website: z.union([z.string().trim().url("Enter a valid URL."), z.literal("")]).optional(),
  budget: z.string().min(1, "Pick a budget range."),
  timeline: z.string().min(1, "Pick a timeline."),
  serviceTypes: z.array(z.string()).min(1, "Pick at least one service."),
  projectDetails: z.string().trim().min(10, "A few more details would help.").max(2000),
  // Honeypot — real visitors never see or fill this field (see InquiryForm).
  // Any value here means a bot filled every input it could find.
  hp: z.string().max(200).optional(),
});

export type InquiryValues = z.infer<typeof inquirySchema>;

export const bookingSchema = z.object({
  fullName: z.string().trim().min(2, "Tell us your name.").max(100),
  email: z.string().trim().email("Enter a valid email."),
  preferredDate: z.string().min(1, "Pick a date."),
  preferredTime: z.string().min(1, "Pick a time."),
  timeZone: z.string().min(1, "Pick a time zone."),
  // Honeypot — same trick as the inquiry form.
  hp: z.string().max(200).optional(),
});

export type BookingValues = z.infer<typeof bookingSchema>;
