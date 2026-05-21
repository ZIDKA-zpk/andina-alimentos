"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const sellerSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  id: z.string().uuid(),
  is_active: z.boolean(),
  phone: z
    .string()
    .trim()
    .max(30)
    .transform((value) => (value.length ? value : null)),
});

export async function updateSeller(formData: FormData) {
  await requireRole("admin");

  const parsed = sellerSchema.safeParse({
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
