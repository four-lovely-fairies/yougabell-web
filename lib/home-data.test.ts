import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getDemoHomeDashboard } from "./home-data";

void describe("home data", () => {
  void it("provides complete demo data for the home dashboard", () => {
    const data = getDemoHomeDashboard();

    assert.equal(data.children.length >= 1, true);
    assert.equal(data.week.days.length, 7);
    assert.equal(typeof data.notifications.unreadCount, "number");
    assert.equal(data.reportSummary?.title, "지난주 아이와 함께한 놀이 시간");
    assert.equal(data.reportSummary?.totalDurationLabel, "1시간 17분");
    assert.ok(data.recommendedMission?.title);
  });
});
