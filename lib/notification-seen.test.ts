import assert from "node:assert/strict";
import test from "node:test";
import { hasNewNotification } from "./notification-seen";

test("알림 종 빨간 점: 마지막으로 알림 창을 연 뒤 온 알림이 있을 때만", () => {
  const list = [{ createdAt: "2026-11-19T10:00:00.000Z" }];
  const openedBefore = Date.parse("2026-11-19T09:00:00.000Z");
  const openedAfter = Date.parse("2026-11-19T11:00:00.000Z");
  assert.equal(hasNewNotification(list, openedBefore), true);
  assert.equal(hasNewNotification(list, openedAfter), false);
  assert.equal(hasNewNotification([], 0), false);
  // 한 번도 연 적 없으면(0) 알림이 있기만 해도 점
  assert.equal(hasNewNotification(list, 0), true);
});
