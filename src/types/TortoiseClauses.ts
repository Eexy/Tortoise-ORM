import firebase from "firebase/compat";
import { FirebaseBaseType } from "./FirebaseType";
import WhereFilterOp = firebase.firestore.WhereFilterOp;

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