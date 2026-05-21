"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const productSchema = z.object({
  base_price: z.coerce.number().min(0),
  id: z.string().uuid(),
  is_active: z.boolean(),
  promo_price: z
    .union([z.literal(""), z.coerce.number().min(0)])
    .transform((value) => (value === "" ? null : value)),
  stock_qty: z.coerce.number().int().min(0),
}).superRefine((product, ctx) => {
  if (product.promo_price !== null && product.promo_price > product.base_price) {
    ctx.addIssue({
      code: "custom",
      message: "La promo no puede superar el precio base.",
      path: ["promo_price"],
    });
  }
});

export async function updateProduct(formData: FormData) {
  await requireRole("admin");

  const parsed = productSchema.safeParse({
    base_price: formData.get("base_price"),
    id: formData.get("id"),
    is_active: formData.get("is_active") === "on",
    promo_price: formData.get("promo_price")?.toString() ?? "",
    stock_qty: formData.get("stock_qty"),
  });

  if (!parsed.success) {
    redirect("/admin/productos?error=Datos invalidos");
  }

  const supabase = await createClient();
  const { id, ...values } = parsed.data;
  const { error } = await supabase.from("products").update(values).eq("id", id);

  if (error) {
    redirect(`/admin/productos?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  redirect("/admin/productos?success=Producto actualizado");
}
