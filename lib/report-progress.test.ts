import assert from "node:assert/strict";
import test from "node:test";
import {
  daysUntilWeeklyReport,
  getWeeklyReportCountdown,
} from "./report-progress";

test("weekly report countdown targets Sunday", () => {
  assert.equal(daysUntilWeeklyReport(new Date("2026-08-27T12:00:00")), 3);
  assert.equal(daysUntilWeeklyReport(new Date("2026-08-30T12:00:00")), 7);
});

test("weekly report countdown uses the Monday morning copy on Sunday", () => {
  assert.deepEqual(
    getWeeklyReportCountdown(new Date("2026-08-30T12:00:00")),
    { kind: "generation_tomorrow" },
  );
  assert.deepEqual(
    getWeeklyReportCountdown(new Date("2026-08-29T12:00:00")),
    { kind: "days", daysRemaining: 1 },
  );
});
