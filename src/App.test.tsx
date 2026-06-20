import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders the complete chart, fortune, and classical-text workspace", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "紫微古籍馆" }),
    ).toBeInTheDocument();
    const chart = screen.getByRole("region", { name: "紫微斗数命盘" });
    expect(within(chart).getAllByRole("button")).toHaveLength(12);
    expect(screen.getByText("大限")).toBeInTheDocument();
    expect(screen.getByText("小限")).toBeInTheDocument();
    expect(screen.getByText("流年")).toBeInTheDocument();
    expect(screen.getByText("流月")).toBeInTheDocument();
    expect(screen.getByText("流日")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "四柱神煞" }),
    ).toBeInTheDocument();
    expect(screen.getByText("古籍原文")).toBeInTheDocument();
  });

  it("uses a selected palace to search the classical collection", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /财帛宫/ }));

    expect(screen.getByRole("searchbox", { name: "搜索古籍" })).toHaveValue(
      "财帛",
    );
  });

  it("uses a shensha hit to search its classical source", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /天乙贵人/ }));

    expect(screen.getByRole("searchbox", { name: "搜索古籍" })).toHaveValue(
      "天乙贵人",
    );
    expect(
      screen.getByRole("heading", { name: /三命通会/ }),
    ).toBeInTheDocument();
  });

  it("opens a classical text that matches the default search", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "紫微斗数全书 · 卷三" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/文本来源：维基文库/)).not.toBeInTheDocument();
  });

  it("keeps the target date in sync with the fortune year controls", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "查看下一年" }));

    expect(screen.getByLabelText("查看日期")).toHaveValue(
      "2027-06-20",
    );
  });

  it("focuses and closes the algorithm dialog with the keyboard", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "打开算法设置" }));

    expect(
      screen.getByRole("button", { name: "关闭算法说明" }),
    ).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(
      screen.queryByRole("dialog", { name: "这张命盘怎么算" }),
    ).not.toBeInTheDocument();
  });

  it("applies and remembers an algorithm profile", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "打开算法设置" }));
    await user.selectOptions(screen.getByLabelText("安星法"), "zhongzhou");
    await user.click(
      screen.getByRole("button", { name: "应用并重新排盘" }),
    );

    expect(
      screen.queryByRole("dialog", { name: "这张命盘怎么算" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "打开算法设置" }));
    expect(screen.getByLabelText("安星法")).toHaveValue("zhongzhou");
  });
});
