import {
  Condition,
  TortoiseClauses,
  TortoiseQuery,
} from "../types/TortoiseClauses";

export function buildQueries<T>(where: Record<string, TortoiseClauses<T>>): TortoiseQuery[] {
  const queries: TortoiseQuery[] = [];

  for (const [key, entry] of Object.entries(where)) {
    if (entry !== undefined) {
      if (typeof entry !== "object" || entry === null) {
        queries.push({ path: key, cond: "==", value: entry });
      } else {
        if (isNestedWhereClauses(entry)) {
          const subQueries: TortoiseQuery[] = buildQueries(where[key] as any);
          for (const query of subQueries) {
            query.path = `${key}.${query.path}`;
          }
          queries.push(...subQueries);
        }
        const cond = entry as unknown as Condition;
        if (cond.value !== undefined) {
          queries.push({ path: key, cond: cond.cond, value: cond.value });
        }
      }
    }
  }

  return queries;
}

export function isNestedWhereClauses(obj: Object): boolean {
  for (const key of Object.keys(obj)) {
    if (key !== "cond" && key !== "value") {
      return true;
    }
  }

  return false;
}