import { z } from "zod";

export const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  type: z.enum(["STORE", "WAREHOUSE"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  priceBookId: z.string().optional().nullable(),
});

export type LocationFormValues = z.infer<typeof locationSchema>;
