"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { productFormSchema } from "@/lib/validators/products";

export async function updateProduct(formData: FormData) {
  await requireRole("admin");

  const parsed = productFormSchema.safeParse({
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
