import { describe, it, expect, vi, beforeEach } from "vitest";
import { useContext } from "react";
import { render, screen, act } from "@testing-library/react";
import {
  SchoolMajorContext,
  SchoolMajorContextProvider,
} from "@/components/config-form";

/**
 * Regression test for the closure-stale-state bug: when the combobox
 * fired setValue() then setLabel() back-to-back, both closures captured
 * the SAME stale `school` object — the second call clobbered the first,
 * leaving school.value empty.
 *
 * Each setter must use functional setState so consecutive calls compose.
 */

function ContextProbe({
  onState,
}: {
  onState: (state: { schoolValue: string; schoolLabel: string }) => void;
}) {
  const ctx = useContext(SchoolMajorContext);
  onState({ schoolValue: ctx.schoolValue, schoolLabel: ctx.schoolLabel });
  return (
    <button
      onClick={() => {
        // Mimic the combobox's call pattern: setValue then setLabel,
        // synchronously, both reading the same render's state.
        ctx.setSchool((prev) => ({ ...prev, value: "005059" }));
        ctx.setSchool((prev) => ({ ...prev, label: "Berry College" }));
      }}
    >
      pick
    </button>
  );
}

describe("SchoolMajorContextProvider — sequential setter regression", () => {
  it("keeps both value and label after two consecutive setSchool calls", async () => {
    const states: Array<{ schoolValue: string; schoolLabel: string }> = [];
    render(
      <SchoolMajorContextProvider>
        <ContextProbe onState={(s) => states.push(s)} />
      </SchoolMajorContextProvider>
    );

    await act(async () => {
      screen.getByText("pick").click();
    });

    const final = states[states.length - 1];
    expect(final.schoolValue).toBe("005059");
    expect(final.schoolLabel).toBe("Berry College");
  });
});
