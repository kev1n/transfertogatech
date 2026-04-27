import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CoursePicker } from "@/components/planner/CoursePicker";
import { Slot } from "@/lib/planner/slots";

const slot: Slot = {
  kind: "single",
  key: "MATH:MATH 1551",
  subject: "MATH",
  gtCourse: "MATH 1551",
};

describe("CoursePicker AP click flow", () => {
  it("clicking a single-grant AP exam fires onConfirm with an AP pick", async () => {
    const onConfirm = vi.fn();
    render(<CoursePicker slot={slot} equivalents={[]} onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole("button", { name: /AP credit/i }));
    // AP Calculus AB grants MATH 1551 at score 4 (single grant)
    await userEvent.click(
      screen.getByRole("button", { name: /AP Calculus AB/i })
    );

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "ap",
        examId: "ap-calc-ab",
        score: 4,
        gtCourse: "MATH 1551",
      })
    );
  });

  it("multi-tier exam shows score chips; clicking a chip fires onConfirm", async () => {
    const onConfirm = vi.fn();
    // CHIN 1002 is granted by AP Chinese at BOTH score 3 (Elementary I+II)
    // AND score 4 (II + Intermediate I+II) — so the picker shows two
    // selectable score buttons, one per tier.
    const chinSlot: Slot = {
      kind: "single",
      key: "CHIN:CHIN 1002",
      subject: "CHIN",
      gtCourse: "CHIN 1002",
    };
    render(<CoursePicker slot={chinSlot} equivalents={[]} onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole("button", { name: /AP credit/i }));
    // Click the "Score 4" tier (10 credits awarded).
    await userEvent.click(
      screen.getByRole("button", { name: /Score 4.*10 GT credit/i })
    );

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onConfirm.mock.calls[0][0]).toMatchObject({
      kind: "ap",
      examId: "ap-chinese",
      score: 4,
      gtCourse: "CHIN 1002",
    });
  });
});
