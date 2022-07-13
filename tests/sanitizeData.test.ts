import { sanitizeData } from "../src/lib/sanitizeData";

describe("sanitizeData", () => {
  test("should return object without undefined", () => {
    const res = sanitizeData({
      x: undefined,
      y: { z: { w: undefined, u: 1 } },
    });

    expect(res).not.toHaveProperty("x");
    expect(res.y.z.u).toBe(1);
  });
});