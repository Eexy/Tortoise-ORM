import * as admin from "firebase-admin";

/**
 * Get server timestamps
 * @param {string} appName
 * @returns {admin.firestore.Timestamp}
 */
export function serverTimestamp(appName?: string): admin.firestore.Timestamp {
  return admin.firestore.Timestamp.now();
}