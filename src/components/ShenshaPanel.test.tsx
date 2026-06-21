import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ShenshaPanel } from "./ShenshaPanel";

describe("ShenshaPanel", () => {
  it("renders source-labelled hits and expandable master commentary", async () => {
    const user = userEvent.setup();
    render(
      <ShenshaPanel
        chineseDate="庚午 辛巳 乙酉 甲申"
        gender="男"
        onKeywordSelect={() => undefined}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "四柱神煞" }),
    ).toBeInTheDocument();
    expect(screen.getByText("67 项规则")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "贵人与文教" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /天乙贵人/ })).toHaveTextContent(
      "时柱·申",
    );
    expect(screen.getByRole("link", { name: /核验天乙贵人出处/ })).toHaveAttribute(
      "href",
      expect.stringContaining("三命通會"),
    );
    await user.click(screen.getAllByText("展开大师讲解")[0]);
    expect(
      screen.getByRole("heading", { name: "天乙贵人怎么讲" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("这张盘的天乙贵人落在时柱·申，查法是：日干乙查子、申。"),
    ).toBeInTheDocument();
  });

  it("uses a shensha name to search the classical collection", async () => {
    const user = userEvent.setup();
    const onKeywordSelect = vi.fn();
    render(
      <ShenshaPanel
        chineseDate="庚午 辛巳 乙酉 甲申"
        gender="男"
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
