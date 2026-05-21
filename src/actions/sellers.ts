"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sellerFormSchema } from "@/lib/validators/sellers";

export async function updateSeller(formData: FormData) {
  await requireRole("admin");

  const parsed = sellerFormSchema.safeParse({
    full_name: formData.get("full_name"),
    id: formData.get("id"),
    is_active: formData.get("is_active") === "on",
    phone: formData.get("phone")?.toString() ?? "",
  });

  if (!parsed.success) {
    redirect("/admin/vendedores?error=Datos invalidos");
  }

  const { id, ...values } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update(values)
    .eq("id", id)
    .eq("role", "seller")
    .select("id")
    .single();

  if (error) {
    redirect(`/admin/vendedores?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/vendedores");
  redirect("/admin/vendedores?success=Vendedor actualizado");
}
