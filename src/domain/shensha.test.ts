import { describe, expect, it } from "vitest";
import { calculateShensha } from "./shensha";

describe("calculateShensha", () => {
  it("finds the expanded classic-sourced shensha in the default four pillars", () => {
    const result = calculateShensha("庚午 辛巳 乙酉 甲申", "男");
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
    expect(result.checkedRuleCount).toBe(67);
    expect(names).toEqual(
      expect.arrayContaining([
        "金舆",
        "太极贵人",
        "文星贵",
        "红艳煞",
      ]),
    );
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

  it("calculates month-command virtues, pardons, and seasonal day rules", () => {
    const virtueResult = calculateShensha("甲子 丙寅 戊寅 丁巳", "男");
    const springWasteResult = calculateShensha(
      "甲子 丙寅 庚申 丁巳",
      "男",
    );

    expect(virtueResult.hits.map((hit) => hit.name)).toEqual(
      expect.arrayContaining([
        "天德贵人",
        "月德贵人",
        "天赦",
        "德秀贵人",
      ]),
    );
    expect(springWasteResult.hits.map((hit) => hit.name)).toContain("四废");
  });

  it("calculates day-pillar and hour-pillar special rules", () => {
    const result = calculateShensha("甲子 丙寅 庚辰 癸酉", "男");

    expect(result.hits.map((hit) => hit.name)).toEqual(
      expect.arrayContaining(["魁罡", "金神", "十恶大败"]),
    );
  });

  it("uses gender and year-stem polarity for Yuan Chen, Hook, and Twist", () => {
    const male = calculateShensha("甲子 丁卯 丁未 辛酉", "男");
    const female = calculateShensha("甲子 丁巳 己酉 辛卯", "女");

    expect(male.hits.find((hit) => hit.name === "元辰")?.basis).toEqual(
      expect.arrayContaining([expect.stringContaining("阳男")]),
    );
    expect(male.hits.map((hit) => hit.name)).toEqual(
      expect.arrayContaining(["勾神", "绞神"]),
    );
    expect(female.hits.find((hit) => hit.name === "元辰")?.basis).toEqual(
      expect.arrayContaining([expect.stringContaining("阳女")]),
    );
    expect(female.hits.map((hit) => hit.name)).toEqual(
      expect.arrayContaining(["勾神", "绞神"]),
    );
  });

  it("keeps every hit traceable to a category and an imported classic", () => {
    const result = calculateShensha("甲子 丙寅 庚辰 癸酉", "男");

    for (const hit of result.hits) {
      expect(hit.category).toBeTruthy();
      expect(hit.source.url).toMatch(/^https:\/\/zh\.wikisource\.org\//);
      expect(hit.source.documentId).toMatch(/^bazi\//);
      expect(hit.basis.length).toBeGreaterThan(0);
    }
  });

  it("rejects malformed four pillars", () => {
    expect(() => calculateShensha("庚午 辛巳 乙酉")).toThrow("四柱");
    expect(() => calculateShensha("庚午 辛巳 乙X 甲申")).toThrow("四柱");
  });
});
