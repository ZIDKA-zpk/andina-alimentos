import { describe, expect, it } from "vitest";

import { sellerFormSchema } from "@/lib/validators/sellers";

const sellerId = "9d8ad8f4-188c-4e13-9c08-fd40a01810e4";

describe("sellerFormSchema", () => {
  it("trims name and converts empty phone to null", () => {
    const parsed = sellerFormSchema.safeParse({
      full_name: "  Vendedor Demo  ",
      id: sellerId,
      is_active: true,
      phone: "   ",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.full_name).toBe("Vendedor Demo");
      expect(parsed.data.phone).toBeNull();
    }
  });

  it("rejects empty names", () => {
    const parsed = sellerFormSchema.safeParse({
      full_name: "   ",
      id: sellerId,
      is_active: true,
      phone: "",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects invalid ids", () => {
    const parsed = sellerFormSchema.safeParse({
      full_name: "Vendedor Demo",
      id: "not-a-uuid",
      is_active: true,
      phone: "",
    });

    expect(parsed.success).toBe(false);
  });
});
