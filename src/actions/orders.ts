"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  createOrderInputSchema,
  parseOrderItemsJson,
} from "@/lib/validators/orders";

export async function createOrder(formData: FormData) {
  await requireRole("seller");

  const parsed = createOrderInputSchema.safeParse({
    idempotencyKey: formData.get("idempotency_key")?.toString(),
    items: parseOrderItemsJson(formData.get("items")?.toString()),
    notes: formData.get("notes")?.toString(),
  });

  if (!parsed.success) {
    redirect(
      "/productos?error=No pudimos leer el pedido. Revisa las cantidades e intentalo nuevamente.",
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_order", {
    p_idempotency_key: parsed.data.idempotencyKey,
    p_items: parsed.data.items,
    p_notes: parsed.data.notes ?? null,
  });

  if (error) {
    redirect(`/productos?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/productos");
  revalidatePath("/pedidos");
  revalidatePath("/admin/pedidos");
  redirect("/pedidos?success=Pedido recibido correctamente");
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
