import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClassRow } from "@/components/class-picker/ClassRow";
import { Class } from "@/types/mongo/mongotypes";

const eq1: Class = {
  className: "BIO 111",
  title: "Bio I",
  level: "LD",
  minimumGrade: "C",
  gaEquivalent: "BIOS 1107",
  gaEquivalentTitle: "GT Bio I",
  creditHours: "3.0",
};

const eq2: Class = {
  className: "BIO 112",
  title: "Bio II",
  level: "LD",
  minimumGrade: "C",
  gaEquivalent: "BIOS 1108",
  gaEquivalentTitle: "GT Bio II",
  creditHours: "3.0",
};

function renderInTable(ui: React.ReactElement) {
  return render(
    <table>
      <tbody>{ui}</tbody>
    </table>
  );
}

describe("ClassRow click flow", () => {
  it("clicking a card visually selects it (border-primary class)", async () => {
    const user = userEvent.setup();
    renderInTable(
      <ClassRow
        gtClassLabel="BIOS 1107"
        dialogTitleSuffix="BIOS 1107"
        equivalents={[eq1, eq2]}
      />
    );

    // Open dialog
    await user.click(screen.getByRole("button", { name: /Choose Equivalent Class/i }));

    // Find the card title for BIO 111 and click its enclosing card
    const eq1Title = await screen.findByText("BIO 111");
    // Walk up to the card root (the div with cursor-pointer class)
    const card = eq1Title.closest('[class*="cursor-pointer"]') as HTMLElement;
    expect(card).toBeTruthy();

    await user.click(card);

    // Border-primary should now be on the card
    expect(card.className).toContain("border-primary");
  });

  it("Select Class button confirms the pending choice and shows it in the row", async () => {
    const user = userEvent.setup();
    renderInTable(
      <ClassRow
        gtClassLabel="BIOS 1107"
        dialogTitleSuffix="BIOS 1107"
        equivalents={[eq1]}
      />
    );

    await user.click(screen.getByRole("button", { name: /Choose Equivalent Class/i }));
    const eq1Title = await screen.findByText("BIO 111");
    const card = eq1Title.closest('[class*="cursor-pointer"]') as HTMLElement;
    await user.click(card);

    await user.click(screen.getByRole("button", { name: /Select Class/i }));

    // The row's trigger should now show the chosen class
    expect(
      screen.getByRole("button", { name: /BIO 111/i })
    ).toBeInTheDocument();
  });
});
