import { getTortoiseApp } from "../src/lib/getTortoiseApp";

describe("getTortoiseApp", () => {
  test("should throw error if app doesn't exist", () => {
    expect(() => getTortoiseApp("")).toThrow();
  });
});