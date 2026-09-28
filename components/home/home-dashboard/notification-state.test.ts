import assert from "node:assert/strict";
import { it } from "node:test";
import { applyNotificationAction } from "./notification-state";
import type { HomeDashboard } from "@/lib/home-data";

const initial = {
  notifications: {
    unreadCount: 3,
    latest: [
      { id: "one", readAt: null },
      { id: "two", readAt: null },
      { id: "three", readAt: "2026-09-20T00:00:00Z" },
    ],
  },
} as HomeDashboard;

void it("optimistically reads one item without double decrement", () => {
  const first = applyNotificationAction(initial, { type: "read", id: "one" });
  assert.equal(first.notifications.unreadCount, 2);
  assert.ok(first.notifications.latest[0].readAt);
  assert.equal(
    applyNotificationAction(first, { type: "read", id: "one" }),
    first,
  );
  assert.equal(initial.notifications.latest[0].readAt, null);
});

void it("optimistically reads all; the caller can discard this state on failure", () => {
  const updated = applyNotificationAction(initial, { type: "read-all" });
  assert.equal(updated.notifications.unreadCount, 0);
  assert.ok(updated.notifications.latest.every((item) => item.readAt));
  assert.equal(initial.notifications.unreadCount, 3);
});
