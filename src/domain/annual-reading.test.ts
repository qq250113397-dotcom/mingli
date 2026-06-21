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
    const yearlyPalace = chart.palaces[chart.fortune.yearly.index];
    const namedStar = yearlyPalace.majorStars[0]?.name;

    expect(reading.title).toContain("2026");
    expect(reading.sections).toHaveLength(5);
    expect(reading.sections.map((section) => section.label)).toEqual(
      expect.arrayContaining(["十年气候", "今年落点", "四化怎么走", "落地判断"]),
    );
    expect(reading.summary).toContain("不是只看一个流年宫");
    if (namedStar) {
      expect(
        reading.sections.some((section) => section.body.includes(namedStar)),
      ).toBe(true);
    }
    for (const mutagen of chart.fortune.yearly.mutagens) {
      expect(
        reading.sections.some((section) => section.body.includes(mutagen)),
      ).toBe(true);
    }
    expect(reading.evidence).toHaveLength(6);
    expect(reading.evidence.map((item) => item.label)).toEqual(
      expect.arrayContaining(["大限命宫", "流年命宫", "化禄", "化忌"]),
    );
  });

  it("explains the interaction instead of repeating generic palace templates", () => {
    const reading = createAnnualReading(buildChart(birth, "2027-06-20"));
    const copy = reading.sections.map((section) => section.body).join("");

    expect(copy).toMatch(/大限.*流年/);
    expect(copy).toMatch(/化禄.*化权.*化科/);
    expect(copy).toMatch(/化忌/);
    expect(copy).not.toContain("把年度目标压缩成三件可执行的小事");
  });

  it("does not present traditional interpretation as a guaranteed outcome", () => {
    const reading = createAnnualReading(buildChart(birth, "2026-06-20"));
    const copy = reading.sections.map((section) => section.body).join("");

    expect(copy).not.toMatch(/一定|必然|保证|注定|必有/);
    expect(reading.disclaimer).toContain("传统文化");
  });
});
