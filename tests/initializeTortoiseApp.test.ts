import { getTortoiseStorage } from "../src";
import { initializeTortoiseApp } from "../src";
import { app } from "firebase-admin";
import App = app.App;

describe("initializeTortoiseApp", () => {
  test("should throw error if app already exist", () => {
    const storage = getTortoiseStorage();
    storage["test"] = {} as App;
    expect(() => initializeTortoiseApp({} as App, "test")).toThrow();
  });
});