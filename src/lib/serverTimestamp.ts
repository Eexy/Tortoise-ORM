import * as admin from "firebase-admin";

/**
 * Get server timestamps
 * @returns {admin.firestore.Timestamp}
 */
export function serverTimestamp(): admin.firestore.Timestamp {
  return admin.firestore.Timestamp.now();
}