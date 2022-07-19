import { buildQueries } from "../src";
import { isGreaterThan, isIn } from "../src";
import { TortoiseQuery } from "../src";


describe("buildQueries", () => {
  test("should return empty array if empty where condition", () => {
    const res = buildQueries({});
    expect(res).toStrictEqual([]);
  });

  test("should return query with equal condition", () => {
    const res = buildQueries({ x: 2 });
    expect(res).toHaveLength(1);

    const query = res[0] as TortoiseQuery;
    expect(query).toHaveProperty("path", "x");
    expect(query).toHaveProperty("cond", "==");
    expect(query).toHaveProperty("value", 2);
  });

  test("should return array of queries when 1 level deepness", () => {
    const res = buildQueries({ x: isGreaterThan(2) });
    expect(res).toHaveLength(1);

    const query = res[0] as TortoiseQuery;
    expect(query).toHaveProperty("path", "x");
    expect(query).toHaveProperty("cond", ">");
    expect(query).toHaveProperty("value", 2);
  });

  test("should return queries when nested where clause", () => {
    const res = buildQueries({
      x: {
        y: { z: isGreaterThan(1) },
        a: isIn([1, 2]),
      },
    });
    expect(res).toHaveLength(2);

    const firstQuery = res[0] as TortoiseQuery;
    expect(firstQuery).toHaveProperty("path", "x.y.z");
    expect(firstQuery).toHaveProperty("cond", ">");
    expect(firstQuery).toHaveProperty("value", 1);

    const secondQuery = res[1] as TortoiseQuery;
    expect(secondQuery).toHaveProperty("path", "x.a");
    expect(secondQuery).toHaveProperty("cond", "in");
    expect(secondQuery).toHaveProperty("value", [1, 2]);
  });
});