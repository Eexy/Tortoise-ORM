import { getTortoiseStorage } from "./getTortoiseStorage";
import { app } from "firebase-admin";
import App = app.App;

/**
 * Get app by name
 * @param {string} appName
 * @throws Throw error when app doesn't exist
 * @return {App}
 */
export function getTortoiseApp(appName: string): App {
  const storage = getTortoiseStorage();

  if (!storage[appName]) {
    throw new Error(`App ${appName} doesn't exist`);
  }

  return storage[appName];
}