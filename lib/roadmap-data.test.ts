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

void describe("getDemoRoadmap", () => {
  void it("지표 문장마다 독립된 체크 항목을 만든다", () => {
    const roadmap = getDemoRoadmap(2);

    assert.equal(roadmap.milestonesByCategory[0].items.length, 4);
    assert.equal(roadmap.milestonesByCategory[1].items.length, 2);
    assert.equal(roadmap.milestonesByCategory[2].items.length, 2);
    assert.equal(roadmap.milestonesByCategory[3].items.length, 3);
  });

  void it("선택한 월령에 맞는 데모 지표를 반환한다", () => {
    const fourMonths = getDemoRoadmap(4);
    const nineMonths = getDemoRoadmap(9);

    assert.equal(fourMonths.targetMonth, 4);
    assert.equal(nineMonths.targetMonth, 9);
    assert.notEqual(
      fourMonths.milestonesByCategory[0].items[0].description,
      nineMonths.milestonesByCategory[0].items[0].description,
    );
  });
});
