import { describe, expect, it } from "vitest";
import {
  buildDecadalTimeline,
  createAnnualReading,
} from "./annual-reading";
import { buildChart, DEFAULT_ALGORITHM_OPTIONS } from "./chart";

const birth = {
  calendar: "solar" as const,
  date: "1990-5-20",
  timeIndex: 8,
  gender: "男" as const,
  fixLeap: true,
  isLeapMonth: false,
};

describe("buildDecadalTimeline", () => {
  it("builds every year in the selected ten-year decadal range", () => {
    const timeline = buildDecadalTimeline(
      birth,
      "2026-06-20",
      DEFAULT_ALGORITHM_OPTIONS,
    );

    expect(timeline.years).toHaveLength(10);
    expect(timeline.years[0].year).toBe(2022);
    expect(timeline.years.at(-1)?.year).toBe(2031);
    expect(timeline.years.find((item) => item.year === 2026)).toMatchObject({
      nominalAge: 37,
      heavenlyStem: "丙",
      earthlyBranch: "午",
    });
    expect(timeline.decadalRange).toEqual([32, 41]);
  });

  it("keeps leap-day targets valid across ordinary years", () => {
    const timeline = buildDecadalTimeline(
      birth,
      "2028-02-29",
      DEFAULT_ALGORITHM_OPTIONS,
    );

    expect(timeline.years).toHaveLength(10);
    expect(timeline.years.every((item) => item.focusPalace)).toBe(true);
  });
});

describe("createAnnualReading", () => {
  it("turns the annual palace and four transformations into traceable notes", () => {
    const chart = buildChart(birth, "2026-06-20");
    const reading = createAnnualReading(chart);

    expect(reading.title).toContain("2026");
    expect(reading.sections.map((section) => section.label)).toEqual([
      "年度主轴",
      "机会窗口",
      "需要留意",
      "行动建议",
    ]);
    expect(reading.evidence).toHaveLength(6);
    expect(reading.evidence.map((item) => item.label)).toEqual(
      expect.arrayContaining(["大限命宫", "流年命宫", "化禄", "化忌"]),
    );
  });

  it("does not present traditional interpretation as a guaranteed outcome", () => {
    const reading = createAnnualReading(buildChart(birth, "2026-06-20"));
    const copy = reading.sections.map((section) => section.body).join("");

    expect(copy).not.toMatch(/一定|必然|保证|注定|必有/);
    expect(reading.disclaimer).toContain("传统文化");
  });
});
