import { FirebaseBaseType } from "./FirebaseType";
import { firestore } from "firebase-admin";
import WhereFilterOp = firestore.WhereFilterOp;

export type TortoiseClauses<T> = {
  [k in keyof T]: FirebaseBaseType | Condition | TortoiseClauses<T[k]>;
}

export interface Condition {
  cond: WhereFilterOp,
  value: any
}

export interface TortoiseQuery extends Condition {
  path: string;
}