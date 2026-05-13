import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getDemoWeeklyReportCurrent,
  splitDurationLabel,
} from "./weekly-report-data";

void describe("weekly report data", () => {
  void it("provides demo report data with seven weekdays and best moments", () => {
    const data = getDemoWeeklyReportCurrent();

    assert.equal(data.selectedChild?.name, "김유스");
    assert.equal(data.report?.missionSummary.days.length, 7);
    assert.equal(data.report?.topKeywords.length, 3);
    assert.equal(data.report?.bestMoments.length >= 1, true);
    assert.equal(data.emptyState, null);
  });

  void it("splits Korean duration labels into numeric segments", () => {
    assert.deepEqual(splitDurationLabel("1시간 17분"), [
      { value: "1", unit: "시간" },
      { value: "17", unit: "분" },
    ]);
    assert.deepEqual(splitDurationLabel("42분"), [{ value: "42", unit: "분" }]);
  });
});
