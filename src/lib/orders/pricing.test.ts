import { describe, expect, it } from "vitest";

import { calculateEstimatedOrderTotal } from "@/lib/orders/pricing";
import type { ProductListItem } from "@/lib/data";

const products: ProductListItem[] = [
  {
    base_price: 2,
    description: null,
    discount_rules: [
      {
        active: true,
        discount_percent: 5,
        id: "rule-24",
        min_qty: 24,
      },
      {
        active: true,
        discount_percent: 10,
        id: "rule-48",
        min_qty: 48,
      },
    ],
    id: "bolo-leche",
    image_url: null,
    is_active: true,
    name: "Bolo leche",
    promo_price: 1.8,
    sku: "BOLO-LECHE",
    stock_qty: 1000,
  },
  {
    base_price: 4,
    description: null,
    discount_rules: [],
    id: "sandwich",
    image_url: null,
    is_active: true,
    name: "Sandwich",
    promo_price: null,
    sku: "SANDWICH",
    stock_qty: 300,
  },
];

describe("calculateEstimatedOrderTotal", () => {
  it("uses promo price and highest applicable discount", () => {
    const total = calculateEstimatedOrderTotal(products, [
      { product_id: "bolo-leche", quantity: 48 },
    ]);

    expect(total).toBeCloseTo(77.76);
  });

  it("uses base price when there is no promo or discount", () => {
    const total = calculateEstimatedOrderTotal(products, [
      { product_id: "sandwich", quantity: 3 },
    ]);

    expect(total).toBe(12);
  });

  it("ignores unknown products and non-positive quantities", () => {
    const total = calculateEstimatedOrderTotal(products, [
      { product_id: "unknown", quantity: 10 },
      { product_id: "sandwich", quantity: 0 },
    ]);

    expect(total).toBe(0);
  });
});
