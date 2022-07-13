import { FirestoreDocument } from "./FirestoreDocument";

export type FirestoreDocResponse<T> =
  FirestoreSuccessDocResponse<T>
  | FirestoreFailedResponse

export type FirestoreDocsResponse<T> =
  FirestoreSuccessDocsResponse<T>
  | FirestoreFailedResponse

export type FirestoreSuccessDocResponse<T> = [T & FirestoreDocument, null]

export type FirestoreFailedResponse = [null, string]

export type FirestoreSuccessDocsResponse<T> = [(T & FirestoreDocument)[], null]