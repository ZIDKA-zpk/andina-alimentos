import { z } from "zod";

export const productFormSchema = z
  .object({
    base_price: z.coerce.number().min(0),
    id: z.string().uuid(),
    is_active: z.boolean(),
    promo_price: z
      .union([z.literal(""), z.coerce.number().min(0)])
      .transform((value) => (value === "" ? null : value)),
    stock_qty: z.coerce.number().int().min(0),
  })
  .superRefine((product, ctx) => {
    if (
      product.promo_price !== null &&
      product.promo_price > product.base_price
    ) {
      ctx.addIssue({
        code: "custom",
        message: "La promo no puede superar el precio base.",
        path: ["promo_price"],
      });
    }
  });
