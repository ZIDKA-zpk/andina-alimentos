import { describe, expect, it } from "vitest";

import {
  assertCanTransitionOrderStatus,
  canTransitionOrderStatus,
  getNextOrderStatuses,
  isFinalOrderStatus,
} from "@/domain/orders/status";

describe("order status domain rules", () => {
  it("allows pending orders to be approved, rejected or cancelled", () => {
    expect(canTransitionOrderStatus("pending", "approved")).toBe(true);
    expect(canTransitionOrderStatus("pending", "rejected")).toBe(true);
    expect(canTransitionOrderStatus("pending", "cancelled")).toBe(true);
  });

  it("does not allow processed orders to change status again", () => {
    expect(canTransitionOrderStatus("approved", "rejected")).toBe(false);
    expect(canTransitionOrderStatus("rejected", "approved")).toBe(false);
    expect(canTransitionOrderStatus("cancelled", "approved")).toBe(false);
  });

  it("identifies final order statuses", () => {
    expect(isFinalOrderStatus("pending")).toBe(false);
    expect(isFinalOrderStatus("approved")).toBe(true);
    expect(isFinalOrderStatus("rejected")).toBe(true);
    expect(isFinalOrderStatus("cancelled")).toBe(true);
  });

  it("returns the next available statuses", () => {
    expect(getNextOrderStatuses("pending")).toEqual([
      "approved",
      "rejected",
      "cancelled",
    ]);
    expect(getNextOrderStatuses("approved")).toEqual([]);
  });

  it("throws when a transition is invalid", () => {
    expect(() =>
      assertCanTransitionOrderStatus("approved", "cancelled"),
    ).toThrow("No se puede cambiar un pedido de approved a cancelled.");
  });
});
