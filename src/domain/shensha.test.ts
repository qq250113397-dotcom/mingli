import { describe, expect, it } from "vitest";
import { calculateShensha } from "./shensha";

describe("calculateShensha", () => {
  it("finds the classic-sourced shensha in the default four pillars", () => {
    const result = calculateShensha("庚午 辛巳 乙酉 甲申");
    const names = result.hits.map((hit) => hit.name);

    expect(result.pillars.map((pillar) => pillar.value)).toEqual([
      "庚午",
      "辛巳",
      "乙酉",
      "甲申",
    ]);
    expect(result.voidBranches).toEqual(["午", "未"]);
    expect(names).toEqual(
      expect.arrayContaining([
        "天乙贵人",
        "驿马",
        "咸池",
        "将星",
        "亡神",
        "旬空",
      ]),
    );
    expect(
      result.hits.find((hit) => hit.name === "天乙贵人")?.matches,
    ).toEqual(expect.arrayContaining(["时柱·申"]));
    expect(
      result.hits.find((hit) => hit.name === "旬空")?.matches,
    ).toEqual(expect.arrayContaining(["年柱·午"]));
  });

  it("uses the five-yang-stem rule for Yang Blade", () => {
    const yangDay = calculateShensha("甲子 丙寅 庚申 辛酉");
    const yinDay = calculateShensha("甲子 丙寅 辛酉 庚申");

    expect(
      yangDay.hits.find((hit) => hit.name === "阳刃")?.matches,
    ).toEqual(["时柱·酉"]);
    expect(
      yinDay.hits.some((hit) => hit.name === "阳刃"),
    ).toBe(false);
  });

  it("covers all six void-branch pairs", () => {
    const dayPillars = ["甲子", "甲戌", "甲申", "甲午", "甲辰", "甲寅"];

    expect(
      dayPillars.map(
        (dayPillar) =>
          calculateShensha(`丙寅 丁卯 ${dayPillar} 戊辰`).voidBranches,
      ),
    ).toEqual([
      ["戌", "亥"],
      ["申", "酉"],
      ["午", "未"],
      ["辰", "巳"],
      ["寅", "卯"],
      ["子", "丑"],
    ]);
  });

  it("rejects malformed four pillars", () => {
    expect(() => calculateShensha("庚午 辛巳 乙酉")).toThrow("四柱");
    expect(() => calculateShensha("庚午 辛巳 乙X 甲申")).toThrow("四柱");
  });
});
