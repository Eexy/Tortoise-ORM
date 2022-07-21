import * as admin from "firebase-admin";

/**
 * Get server timestamps
 * @returns {admin.firestore.Timestamp}
 */
export function serverTimestamp(): number {
  return admin.firestore.Timestamp.now().toMillis();
}