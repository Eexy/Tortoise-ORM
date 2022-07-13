import firebase from "firebase/compat";
import { getTortoiseStorage } from "./getTortoiseStorage";
import App = firebase.app.App;

/**
 * Initialize Tortoise's app
 * @param {App} app
 * @param {string} appName
 * @throws Throw error if appName is already taken
 * @return {void}
 */
export function initializeTortoiseApp(app: App,
                                      appName: string = "admin"): void {
  const tortoiseStorage = getTortoiseStorage();

  if (tortoiseStorage[appName]) {
    throw new Error(`Already existing app : ${appName}`);
  }

  tortoiseStorage[appName] = app;
}