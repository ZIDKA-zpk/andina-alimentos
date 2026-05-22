import { z } from "zod";

export const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const createOrderInputSchema = z.object({
  idempotencyKey: z.string().uuid(),
  items: z.array(orderItemSchema).min(1),
  notes: z.string().max(500).optional(),
});

export function parseOrderItemsJson(value: string | null | undefined) {
  try {
    return JSON.parse(value || "[]") as unknown;
  } catch {
    return null;
  }
}
