import { describe, expect, it } from "vitest";
import { CLASSIC_DOCUMENTS } from "./classic-content";

describe("CLASSIC_DOCUMENTS", () => {
  it("loads the first sourced Markdown collection at build time", () => {
    expect(CLASSIC_DOCUMENTS.length).toBeGreaterThanOrEqual(8);
    expect(
      CLASSIC_DOCUMENTS.every(
        (document) =>
          document.source.startsWith("https://zh.wikisource.org/") &&
          document.license === "CC BY-SA 4.0",
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
});
