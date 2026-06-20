import { describe, expect, it } from "vitest";
import { CLASSIC_DOCUMENTS } from "./classic-content";

describe("CLASSIC_DOCUMENTS", () => {
  it("loads the expanded sourced Markdown collection at build time", () => {
    expect(CLASSIC_DOCUMENTS.length).toBeGreaterThanOrEqual(134);
    expect(
      CLASSIC_DOCUMENTS.every(
        (document) =>
          document.source.startsWith("https://zh.wikisource.org/") &&
          document.license === "CC BY-SA 4.0" &&
          document.body.replace(/\s+/g, "").length >= 30 &&
          !document.body.startsWith("#重定向") &&
          !document.body.includes("}}") &&
          !document.body.includes("''") &&
          !/^\*\*\s*$/m.test(document.body),
      ),
    ).toBe(true);
  });

  it("contains all three initial research categories", () => {
    const categories = new Set(
      CLASSIC_DOCUMENTS.map((document) => document.category),
    );

    expect(categories).toEqual(
      new Set(["紫微斗数", "四柱命理", "易学卜筮"]),
    );
  });

  it("includes the second-phase core books", () => {
    const titles = new Set(
      CLASSIC_DOCUMENTS.map((document) => document.title),
    );

    expect([...titles]).toEqual(
      expect.arrayContaining([
        "紫微斗数全书",
        "三命通会",
        "滴天髓",
        "神峰通考",
        "五行精纪",
        "梅花易数",
        "周易",
        "增删卜易",
        "卜筮正宗",
      ]),
    );
  });

  it("contains all sixty-four Zhouyi hexagrams", () => {
    const zhouyiHexagrams = CLASSIC_DOCUMENTS.filter(
      (document) =>
        document.title === "周易" && document.keywords.includes("六十四卦"),
    );

    expect(zhouyiHexagrams).toHaveLength(64);
  });
});
