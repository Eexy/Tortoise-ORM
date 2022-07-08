import firebase from "firebase/compat";
import { getTortoiseStorage } from "./getTortoiseStorage";
import App = firebase.app.App;

export function initializeTortoiseApp(app: App,
                                      appName: string = "admin"): void {
  const tortoiseStorage = getTortoiseStorage();

  if (tortoiseStorage[appName]) {
    throw new Error(`Already existing app : ${appName}`);
  }

  tortoiseStorage[appName] = app;
}