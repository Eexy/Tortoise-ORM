import { FirestoreDocument } from "./FirestoreDocument";

export interface FirestoreDocResponse<T> {
  doc: T & FirestoreDocument | null;
  err: string | null;
}

export interface FirestoreDocsResponse<T> {
  docs: (T & FirestoreDocument)[] | null;
  err: string | null;
}