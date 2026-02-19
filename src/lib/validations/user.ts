import { z } from "zod";

export const getUserSchema = (roles?: { id: string; name: string }[]) =>
  z
    .object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email"),
      roleId: z.string().min(1, "Role is required"),
      status: z.enum(["active", "inactive"]).optional(),
      defaultLocationId: z.string().optional(),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .optional()
        .or(z.literal("")),
    })
    .superRefine((data, ctx) => {
      if (!roles) return; // If roles not loaded, skip conditional logic or default to safe

      const selectedRole = roles.find((r) => r.id === data.roleId);
      const isGlobalRole =
        selectedRole?.name.toLowerCase() === "admin" ||
        selectedRole?.name.toLowerCase() === "super admin"; // Add other global roles if needed

      if (!isGlobalRole && !data.defaultLocationId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Location is required for this role",
          path: ["defaultLocationId"],
        });
      }
    });

export type UserFormValues = z.infer<ReturnType<typeof getUserSchema>>;
