import { Document } from "./Document";

export type FirestoreDocResponse<T> =
  FirestoreSuccessDocResponse<T>
  | FirestoreFailedResponse

export type FirestoreDocsResponse<T> =
  FirestoreSuccessDocsResponse<T>
  | FirestoreFailedResponse

export type FirestoreSuccessDocResponse<T> = [T & Document, null]

export type FirestoreFailedResponse = [null, string]

export type FirestoreSuccessDocsResponse<T> = [(T & Document)[], null]