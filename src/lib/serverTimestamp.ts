import { getTortoiseApp } from "./getTortoiseApp";
import * as admin from "firebase-admin";

/**
 * Get server timestamps
 * @param {string} appName
 * @returns {admin.firestore.Timestamp}
 */
export function serverTimestamp(appName?: string): admin.firestore.Timestamp {
  const app = appName ? getTortoiseApp(appName) : getTortoiseApp();

  return admin.firestore.Timestamp.now();
}