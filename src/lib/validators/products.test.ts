import { describe, expect, it } from "vitest";

import { productFormSchema } from "@/lib/validators/products";

const productId = "9d8ad8f4-188c-4e13-9c08-fd40a01810e4";

describe("productFormSchema", () => {
  it("coerces numeric form values and empty promo", () => {
    const parsed = productFormSchema.safeParse({
      base_price: "10.5",
      id: productId,
      is_active: true,
      promo_price: "",
      stock_qty: "20",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.base_price).toBe(10.5);
      expect(parsed.data.promo_price).toBeNull();
      expect(parsed.data.stock_qty).toBe(20);
    }
  });

  it("rejects promo price greater than base price", () => {
    const parsed = productFormSchema.safeParse({
      base_price: "10",
      id: productId,
      is_active: true,
      promo_price: "11",
      stock_qty: "20",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects negative stock", () => {
    const parsed = productFormSchema.safeParse({
      base_price: "10",
      id: productId,
      is_active: true,
      promo_price: "",
      stock_qty: "-1",
    });

    expect(parsed.success).toBe(false);
  });
});
