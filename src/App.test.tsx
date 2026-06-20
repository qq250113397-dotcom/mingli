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
});
