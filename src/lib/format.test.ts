import { describe, expect, it } from "vitest";

import { BOLIVIA_TIME_ZONE, dateFormatter } from "@/lib/format";

describe("format helpers", () => {
  it("formats dates using Bolivia time", () => {
    expect(dateFormatter.resolvedOptions().timeZone).toBe(BOLIVIA_TIME_ZONE);
  });
});
