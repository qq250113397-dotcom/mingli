import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_ALGORITHM_OPTIONS } from "../domain/chart";
import { AlgorithmDialog } from "./AlgorithmDialog";

describe("AlgorithmDialog", () => {
  it("submits a complete algorithm profile", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();

    render(
      <AlgorithmDialog
        options={DEFAULT_ALGORITHM_OPTIONS}
        onApply={onApply}
        onClose={vi.fn()}
      />,
    );

    await user.selectOptions(screen.getByLabelText("安星法"), "zhongzhou");
    await user.selectOptions(screen.getByLabelText("年度分界"), "exact");
    await user.selectOptions(screen.getByLabelText("运限分界"), "exact");
    await user.selectOptions(screen.getByLabelText("小限分界"), "birthday");
    await user.selectOptions(screen.getByLabelText("晚子时归属"), "current");
    await user.click(
      screen.getByRole("button", { name: "应用并重新排盘" }),
    );

    expect(onApply).toHaveBeenCalledWith({
      algorithm: "zhongzhou",
      yearDivide: "exact",
      horoscopeDivide: "exact",
      ageDivide: "birthday",
      dayDivide: "current",
    });
  });
});
