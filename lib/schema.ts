import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name.").max(100),
  email: z.string().trim().email("Enter a valid email."),
  company: z.string().trim().max(100).optional().or(z.literal("")),
  message: z.string().trim().min(10, "A few more details would help.").max(2000),
});

export type ContactValues = z.infer<typeof contactSchema>;
