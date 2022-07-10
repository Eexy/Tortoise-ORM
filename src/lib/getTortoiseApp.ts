import firebase from "firebase/compat";
import { getTortoiseStorage } from "./getTortoiseStorage";
import App = firebase.app.App;

export function getTortoiseApp(appName: string): App {
  const storage = getTortoiseStorage();

  if (!storage[appName]) {
    throw new Error(`App ${appName} doesn't exist`);
  }

  return storage[appName];
}