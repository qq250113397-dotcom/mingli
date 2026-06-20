import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ShenshaPanel } from "./ShenshaPanel";

describe("ShenshaPanel", () => {
  it("renders source-labelled hits for the current four pillars", () => {
    render(
      <ShenshaPanel
        chineseDate="庚午 辛巳 乙酉 甲申"
        onKeywordSelect={() => undefined}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "四柱神煞" }),
    ).toBeInTheDocument();
    expect(screen.getByText("11 项规则")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /天乙贵人/ })).toHaveTextContent(
      "时柱·申",
    );
    expect(screen.getByRole("link", { name: /核验天乙贵人出处/ })).toHaveAttribute(
      "href",
      expect.stringContaining("三命通會"),
    );
  });

  it("uses a shensha name to search the classical collection", async () => {
    const user = userEvent.setup();
    const onKeywordSelect = vi.fn();
    render(
      <ShenshaPanel
        chineseDate="庚午 辛巳 乙酉 甲申"
        onKeywordSelect={onKeywordSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: /天乙贵人/ }));

    expect(onKeywordSelect).toHaveBeenCalledWith(
      "天乙贵人",
      "bazi/sanming-tonghui-3",
    );
  });
});
