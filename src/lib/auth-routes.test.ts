import { describe, expect, it } from "vitest";

import {
  getAllowedNextPath,
  getRoleHome,
  getSafeNextPath,
} from "@/lib/auth-routes";

describe("auth route helpers", () => {
  it("returns the correct home by role", () => {
    expect(getRoleHome("admin")).toBe("/admin");
    expect(getRoleHome("seller")).toBe("/dashboard");
  });

  it("rejects unsafe next paths", () => {
    expect(getSafeNextPath("https://evil.test")).toBeNull();
    expect(getSafeNextPath("//evil.test")).toBeNull();
    expect(getSafeNextPath("admin")).toBeNull();
    expect(getSafeNextPath(null)).toBeNull();
  });

  it("allows each role to continue only to its own area", () => {
    expect(getAllowedNextPath("seller", "/productos")).toBe("/productos");
    expect(getAllowedNextPath("seller", "/admin")).toBe("/dashboard");
    expect(getAllowedNextPath("admin", "/admin/pedidos")).toBe(
      "/admin/pedidos",
    );
    expect(getAllowedNextPath("admin", "/productos")).toBe("/admin");
  });
});
