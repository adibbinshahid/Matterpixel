import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Tell us your name.").max(100),
  email: z.string().trim().email("Enter a valid email."),
  whatsapp: z.string().trim().min(6, "Enter a valid WhatsApp number.").max(30),
  serviceTypes: z.array(z.string()).min(1, "Pick at least one service."),
  projectDetails: z.string().trim().min(10, "A few more details would help.").max(2000),
  // Honeypot — real visitors never see or fill this field (see ContactForm).
  // Any value here means a bot filled every input it could find.
  company: z.string().max(200).optional(),
});

export type ContactValues = z.infer<typeof contactSchema>;
