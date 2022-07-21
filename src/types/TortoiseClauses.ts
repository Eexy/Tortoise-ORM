import { FirebaseBaseType } from "./FirebaseType";

export type TortoiseClauses<T> = {
  [k in keyof Partial<T>]: TortoiseClause<T[k]>;
}

export type TortoiseClause<T> =
  FirebaseBaseType
  | Condition
  | TortoiseClauses<T>

export interface Condition {
  cond: TortoiseFilterOp,
  value: any
}

export type TortoiseFilterOp =
  "=="
  | "<"
  | "<="
  | ">"
  | ">="
  | "in"
  | "not-in"
  | "!="
  | "array-contains-any"
  | "array-contains"

export interface TortoiseQuery extends Condition {
  path: string;
}