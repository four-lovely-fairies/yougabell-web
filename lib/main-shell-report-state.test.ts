import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  reportStateForChild,
  reportStateFromHome,
} from "./main-shell-report-state";

void describe("main shell report state", () => {
  void it("creates child-scoped state from the home response", () => {
    const state = reportStateFromHome(
      {
        selectedChild: { id: "child-1" },
        hasUnviewedWeeklyReport: true,
      } as never,
      123,
    );

    assert.deepEqual(state, {
      childId: "child-1",
      hasUnviewedWeeklyReport: true,
      updatedAt: 123,
    });
  });

  void it("does not expose another child's report state", () => {
    const state = {
      childId: "child-1",
      hasUnviewedWeeklyReport: true,
      updatedAt: 123,
    };

    assert.equal(reportStateForChild(state, "child-2"), null);
    assert.equal(reportStateForChild(state, "child-1"), state);
  });
});
