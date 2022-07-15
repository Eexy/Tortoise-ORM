import { getTortoiseApp, initializeTortoiseApp } from "../src";
import { app } from "firebase-admin";
import App = app.App;


describe("getTortoiseApp", () => {
  test("should throw error if app doesn't exist", () => {
    expect(() => getTortoiseApp("")).toThrow();
  });

  test("should return app", () => {
    initializeTortoiseApp({ test: "hello" } as unknown as App);
    const app = getTortoiseApp("admin");
    expect(app).not.toBe(undefined);
  });
});