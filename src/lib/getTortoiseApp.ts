import { getTortoiseStorage } from "./getTortoiseStorage";
import { app } from "firebase-admin";
import App = app.App;

/**
 * Get app by name
 * @param {string} [appName=admin]
 * @throws Throw error when app doesn't exist
 * @returns {App}
 */
export function getTortoiseApp(appName: string = "admin"): App {
  const storage = getTortoiseStorage();

  if (!storage[appName]) {
    throw new Error(`App ${appName} doesn't exist`);
  }

  return storage[appName];
}