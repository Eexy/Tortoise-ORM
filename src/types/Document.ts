export type Document<T> = T & FirestoreDocument

export interface FirestoreDocument extends Record<string, any> {
  uid: string;
}