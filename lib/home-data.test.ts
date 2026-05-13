import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getDemoHomeDashboard } from "./home-data";

void describe("home data", () => {
  void it("provides complete demo data for the home dashboard", () => {
    const data = getDemoHomeDashboard();

    assert.equal(data.children.length >= 1, true);
    assert.equal(data.week.days.length, 7);
    assert.equal(typeof data.notifications.unreadCount, "number");
    assert.equal(data.reportSummary?.label, "이번 달 함께한 날");
    assert.ok(data.recommendedMission?.title);
  });
});
