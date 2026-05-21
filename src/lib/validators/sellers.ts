import { z } from "zod";

export const sellerFormSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  id: z.string().uuid(),
  is_active: z.boolean(),
  phone: z
    .string()
    .trim()
    .max(30)
    .transform((value) => (value.length ? value : null)),
});
