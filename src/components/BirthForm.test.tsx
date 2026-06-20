import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { BirthInput } from "../domain/chart";
import { BirthForm } from "./BirthForm";

const initialBirth: BirthInput = {
  calendar: "solar",
  date: "1990-05-20",
  timeIndex: 8,
  gender: "男",
  isLeapMonth: false,
  fixLeap: true,
};

describe("BirthForm", () => {
  it("submits the selected birth data and fortune year", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <BirthForm
        initialBirth={initialBirth}
        initialTargetDate="2026-06-20"
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "女" }));
    await user.click(screen.getByRole("button", { name: "开始排盘" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ gender: "女", date: "1990-05-20" }),
      "2026-06-20",
    );
  });

  it("submits the selected fortune date", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <BirthForm
        initialBirth={initialBirth}
        initialTargetDate="2026-06-20"
        onSubmit={onSubmit}
      />,
    );

    await user.clear(screen.getByLabelText("查看日期"));
    await user.type(screen.getByLabelText("查看日期"), "2026-10-01");
    await user.click(screen.getByRole("button", { name: "开始排盘" }));

    expect(onSubmit).toHaveBeenCalledWith(initialBirth, "2026-10-01");
  });

  it("shows the leap-month option only for lunar input", async () => {
    const user = userEvent.setup();

    render(
      <BirthForm
        initialBirth={initialBirth}
        initialTargetDate="2026-06-20"
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText("这是闰月")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("历法"), "lunar");
    expect(screen.getByLabelText("这是闰月")).toBeInTheDocument();
  });
});
