import assert from "node:assert/strict";
import test from "node:test";
import { resolveHomeNotificationStep } from "./home-notification-flow";

test("configured users see the completion notice without another permission request", () => {
  assert.equal(
    resolveHomeNotificationStep({
      configured: true,
      native: true,
      permission: "undetermined",
    }),
    "configured",
  );
});

test("native users with an undetermined permission see the permission prompt", () => {
  assert.equal(
    resolveHomeNotificationStep({
      configured: false,
      native: true,
      permission: "undetermined",
    }),
    "request",
  );
});

test("native users with a denied permission are sent to system settings", () => {
  assert.equal(
    resolveHomeNotificationStep({
      configured: false,
      native: true,
      permission: "denied",
    }),
    "settings",
  );
});

test("native users with permission still register a push token before scheduling", () => {
  assert.equal(
    resolveHomeNotificationStep({
      configured: false,
      native: true,
      permission: "granted",
    }),
    "register",
  );
});

test("browser users can configure the server schedule without native permission", () => {
  assert.equal(
    resolveHomeNotificationStep({
      configured: false,
      native: false,
      permission: null,
    }),
    "schedule",
  );
});
