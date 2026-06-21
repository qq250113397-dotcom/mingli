import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FortuneTimeline } from "./FortuneTimeline";
import {
  buildDecadalTimeline,
  createAnnualReading,
} from "../domain/annual-reading";
import { buildChart, DEFAULT_ALGORITHM_OPTIONS } from "../domain/chart";

const birth = {
  calendar: "solar" as const,
  date: "1990-5-20",
  timeIndex: 8,
  gender: "男" as const,
  fixLeap: true,
  isLeapMonth: false,
};

describe("FortuneTimeline", () => {
  it("shows a selectable decade and emits the selected year", async () => {
    const user = userEvent.setup();
    const onYearChange = vi.fn();
    const timeline = buildDecadalTimeline(
      birth,
      "2026-06-20",
      DEFAULT_ALGORITHM_OPTIONS,
    );

    render(
      <FortuneTimeline
        timeline={timeline}
        selectedYear={2026}
        reading={createAnnualReading(buildChart(birth, "2026-06-20"))}
        onYearChange={onYearChange}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "十年流年图" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /2026 年/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: /2027 年/ }));
    expect(onYearChange).toHaveBeenCalledWith(2027);
  });

  it("shows the traceable master-style commentary sections", () => {
    const chart = buildChart(birth, "2026-06-20");

    render(
      <FortuneTimeline
        timeline={buildDecadalTimeline(
          birth,
          "2026-06-20",
          DEFAULT_ALGORITHM_OPTIONS,
        )}
        selectedYear={2026}
        reading={createAnnualReading(chart)}
        onYearChange={() => undefined}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /大师批注/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("十年气候")).toBeInTheDocument();
    expect(screen.getByText("四化怎么走")).toBeInTheDocument();
    expect(screen.getByText("卡点在哪")).toBeInTheDocument();
    expect(screen.getByText("落地判断")).toBeInTheDocument();
    expect(screen.getByText(/传统文化研究与娱乐/)).toBeInTheDocument();
  });
});
