import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
