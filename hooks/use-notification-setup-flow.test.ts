import assert from "node:assert/strict";
import test from "node:test";
import {
  getNotificationSetupEntryView,
  getViewAfterPermissionRequest,
} from "./use-notification-setup-flow";

test("native notification setup starts with the permission prompt", () => {
  assert.equal(getNotificationSetupEntryView(true), "permission-prompt");
});

test("browser notification setup starts with schedule selection", () => {
  assert.equal(getNotificationSetupEntryView(false), "schedule");
});

test("granted permission advances to schedule selection", () => {
  assert.equal(getViewAfterPermissionRequest("granted"), "schedule");
});

test("denied or unavailable permission advances to system settings", () => {
  assert.equal(
    getViewAfterPermissionRequest("denied"),
    "system-settings-prompt",
  );
  assert.equal(getViewAfterPermissionRequest(null), "system-settings-prompt");
});
