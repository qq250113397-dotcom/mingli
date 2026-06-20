import { describe, expect, it } from "vitest";
import { buildChart, TIME_OPTIONS } from "./chart";

describe("TIME_OPTIONS", () => {
  it("covers early Zi through late Zi as required by iztro", () => {
    expect(TIME_OPTIONS).toHaveLength(13);
    expect(TIME_OPTIONS[0].label).toContain("早子");
    expect(TIME_OPTIONS[12].label).toContain("晚子");
  });
});

describe("buildChart", () => {
  it("builds a complete solar chart and annual fortune", () => {
    const chart = buildChart(
      {
        calendar: "solar",
        date: "1990-5-20",
        timeIndex: 8,
        gender: "男",
        fixLeap: true,
        isLeapMonth: false,
      },
      2026,
    );

    expect(chart.palaces).toHaveLength(12);
    expect(chart.summary.solarDate).toBe("1990-5-20");
    expect(chart.summary.chineseDate.split(" ")).toHaveLength(4);
    expect(chart.fortune.year).toBe(2026);
    expect(chart.fortune.decadal.mutagens).toHaveLength(4);
    expect(chart.fortune.yearly.mutagens).toHaveLength(4);
  });

  it("supports lunar input while returning the converted solar date", () => {
    const chart = buildChart(
      {
        calendar: "lunar",
        date: "1990-4-26",
        timeIndex: 8,
        gender: "女",
        fixLeap: true,
        isLeapMonth: false,
      },
      2026,
    );

    expect(chart.summary.solarDate).toMatch(/^1990-/);
    expect(chart.summary.lunarDate).toContain("四月");
  });

  it("rejects an invalid time index with a plain-language error", () => {
    expect(() =>
      buildChart(
        {
          calendar: "solar",
          date: "1990-5-20",
          timeIndex: 13,
          gender: "男",
          fixLeap: true,
          isLeapMonth: false,
        },
        2026,
      ),
    ).toThrow("出生时辰");
  });
});
