import { FirebaseBaseType } from "../types/FirebaseType";
import { Condition } from "../types/TortoiseClauses";

export function isLessThanOrEqual(x: number): Condition {
  return {
    cond: "<=",
    value: x,
  };
}

export function isLessThan(x: number): Condition {
  return {
    cond: "<",
    value: x,
  };
}

export function isGreaterThanOrEqual(x: number): Condition {
  return {
    cond: ">=",
    value: x,
  };
}

export function isGreaterThan(x: number): Condition {
  return {
    cond: ">",
    value: x,
  };
}

export function isDifferent(x: number | string | boolean | null): Condition {
  return {
    cond: "!=",
    value: x,
  };
}

export function isNotIn(arr: FirebaseBaseType[]): Condition {
  return {
    cond: "not-in",
    value: arr,
  };
}

export function isIn(arr: FirebaseBaseType[]): Condition {
  return {
    cond: "in",
    value: arr,
  };
}

export function isArrayContainsAny(arr: FirebaseBaseType[]): Condition {
  return {
    cond: "array-contains-any",
    value: arr,
  };
}