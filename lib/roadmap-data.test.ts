import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getDemoRoadmap,
  updateRoadmapMilestoneCompletion,
} from "./roadmap-data";

void describe("updateRoadmapMilestoneCompletion", () => {
  void it("선택한 지표만 체크하고 원본 응답은 변경하지 않는다", () => {
    const roadmap = getDemoRoadmap();
    const milestoneId = roadmap.milestonesByCategory[0].items[0].id;

    const updated = updateRoadmapMilestoneCompletion(
      roadmap,
      milestoneId,
      true,
    );

    assert.equal(roadmap.milestonesByCategory[0].items[0].completed, false);
    assert.equal(updated.milestonesByCategory[0].items[0].completed, true);
    assert.equal(updated.milestonesByCategory[1].items[0].completed, false);
  });
});
