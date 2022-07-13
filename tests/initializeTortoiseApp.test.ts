import { getTortoiseStorage } from "../src/lib/getTortoiseStorage";
import firebase from "firebase/compat";
import { initializeTortoiseApp } from "../src/lib/initializeTortoiseApp";
import App = firebase.app.App;

describe("initializeTortoiseApp", () => {
  test("should throw error if app already exist", () => {
    const storage = getTortoiseStorage();
    storage["test"] = {} as App;
    expect(() => initializeTortoiseApp({} as App, "test")).toThrow();
  });
});