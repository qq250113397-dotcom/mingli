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
    expect(screen.getByText("流年")).toBeInTheDocument();
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

  it("opens a classical text that matches the default search", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "紫微斗数全书 · 卷三" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/文本来源：维基文库/)).not.toBeInTheDocument();
  });

  it("keeps the birth form year in sync with the fortune controls", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "查看下一年" }));

    expect(screen.getByRole("spinbutton", { name: "查看流年" })).toHaveValue(
      2027,
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
});
