import firebase from "firebase/compat";
import WhereFilterOp = firebase.firestore.WhereFilterOp;

export type WhereClauses<T> = {
  [k in keyof T]: Clause
}

export interface Clause {
  cond: WhereFilterOp,
  value: any
}