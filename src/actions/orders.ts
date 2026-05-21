"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const itemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const createOrderSchema = z.object({
  items: z.array(itemSchema).min(1),
  notes: z.string().max(500).optional(),
});

export async function createOrder(formData: FormData) {
  await requireRole("seller");

  let items: unknown;

  try {
    items = JSON.parse(formData.get("items")?.toString() || "[]");
  } catch {
    redirect("/productos?error=Pedido invalido");
  }

  const parsed = createOrderSchema.safeParse({
    items,
    notes: formData.get("notes")?.toString(),
  });

  if (!parsed.success) {
    redirect("/productos?error=Pedido invalido");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_order", {
    p_items: parsed.data.items,
    p_notes: parsed.data.notes ?? null,
  });

  if (error) {
    redirect(`/productos?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/productos");
  revalidatePath("/pedidos");
  revalidatePath("/admin/pedidos");
  redirect("/pedidos?success=Pedido creado");
}

export async function approveOrder(formData: FormData) {
  await requireRole("admin");

  const orderId = formData.get("order_id")?.toString();

  if (!orderId) {
    redirect("/admin/pedidos?error=Pedido invalido");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_order", {
    p_order_id: orderId,
  });

  if (error) {
    redirect(`/admin/pedidos?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/productos");
  redirect("/admin/pedidos?success=Pedido aprobado");
}

export async function rejectOrder(formData: FormData) {
  await requireRole("admin");

  const orderId = formData.get("order_id")?.toString();

  if (!orderId) {
    redirect("/admin/pedidos?error=Pedido invalido");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_order", {
    p_order_id: orderId,
    p_reason: "Rechazado por administracion",
  });

  if (error) {
    redirect(`/admin/pedidos?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/pedidos");
  redirect("/admin/pedidos?success=Pedido rechazado");
}
