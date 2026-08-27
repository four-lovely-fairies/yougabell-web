import assert from "node:assert/strict";
import test from "node:test";
import { daysUntilWeeklyReport } from "./report-progress";

test("weekly report countdown targets Sunday", () => {
  assert.equal(daysUntilWeeklyReport(new Date("2026-08-27T12:00:00")), 3);
  assert.equal(daysUntilWeeklyReport(new Date("2026-08-30T12:00:00")), 7);
});
