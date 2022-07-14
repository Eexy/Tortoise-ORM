export type TortoiseDocument<T> = T & FirestoreDocument

export interface FirestoreDocument extends Record<string, any> {
  uid: string;
}