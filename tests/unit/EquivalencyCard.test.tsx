import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EquivalencyCard } from "@/components/class-picker/EquivalencyCard";
import { Class } from "@/types/mongo/mongotypes";

const eq: Class = {
  className: "BIO 111",
  title: "Bio I",
  level: "LD",
  minimumGrade: "C",
  gaEquivalent: "BIOS 1107",
  gaEquivalentTitle: "GT Bio I",
  creditHours: "3.0",
};

describe("EquivalencyCard", () => {
  it("fires onClick when the card is clicked", async () => {
    const onClick = vi.fn();
    render(<EquivalencyCard equivalent={eq} selected={false} onClick={onClick} />);
    await userEvent.click(screen.getByText("BIO 111"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("fires onClick when the credit-hours area is clicked", async () => {
    const onClick = vi.fn();
    render(<EquivalencyCard equivalent={eq} selected={false} onClick={onClick} />);
    await userEvent.click(screen.getByText("3.0 credits"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
