import assert from "node:assert/strict";
import test from "node:test";
import { isFirstPlayEmptyState } from "./weekly-report-data";

const emptyState = (
  reason: NonNullable<Parameters<typeof isFirstPlayEmptyState>[0]>["reason"],
) => ({
  reason,
  title: "title",
  description: "description",
  ctaLabel: "놀이 시작하기",
  ctaHref: "/mission",
});

test("first-play design is exclusive to children who never completed play", () => {
  assert.equal(isFirstPlayEmptyState(emptyState("no_mission_yet")), true);
  assert.equal(isFirstPlayEmptyState(emptyState("no_mission_for_week")), false);
  assert.equal(
    isFirstPlayEmptyState(emptyState("report_generation_pending")),
    false,
  );
  assert.equal(isFirstPlayEmptyState(null), false);
});
