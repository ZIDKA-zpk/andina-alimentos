import { describe, expect, it } from "vitest";

import {
  createOrderInputSchema,
  parseOrderItemsJson,
} from "@/lib/validators/orders";

const productId = "9d8ad8f4-188c-4e13-9c08-fd40a01810e4";

describe("order validators", () => {
  it("accepts a valid order payload", () => {
    const parsed = createOrderInputSchema.safeParse({
      items: [{ product_id: productId, quantity: 2 }],
      notes: "Entregar por la tarde",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects empty orders", () => {
    const parsed = createOrderInputSchema.safeParse({
      items: [],
      notes: "",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects invalid quantities", () => {
    const parsed = createOrderInputSchema.safeParse({
      items: [{ product_id: productId, quantity: 0 }],
    });

    expect(parsed.success).toBe(false);
  });

  it("parses valid JSON and returns null for invalid JSON", () => {
    expect(parseOrderItemsJson(`[{"product_id":"${productId}","quantity":1}]`))
      .toEqual([{ product_id: productId, quantity: 1 }]);
    expect(parseOrderItemsJson("not-json")).toBeNull();
  });
});
