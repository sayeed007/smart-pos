import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  roleId: z.string().min(1, "Role is required"),
  status: z.enum(["active", "inactive"]).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
});

export type UserFormValues = z.infer<typeof userSchema>;
