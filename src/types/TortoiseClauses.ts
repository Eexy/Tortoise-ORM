import { FirebaseBaseType } from "./FirebaseType";
import { firestore } from "firebase-admin";
import WhereFilterOp = firestore.WhereFilterOp;

export type TortoiseClauses<T> = {
  [k in keyof Partial<T>]: TortoiseClause<T[k]>;
}

export type TortoiseClause<T> =
  FirebaseBaseType
  | Condition
  | TortoiseClauses<T>

export interface Condition {
  cond: WhereFilterOp,
  value: any
}

export interface TortoiseQuery extends Condition {
  path: string;
}