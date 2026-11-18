import assert from "node:assert/strict";
import test from "node:test";

import { toAmplitudeEvent, toGoogleAnalyticsEventName } from "./analytics";

test("child identifiers are not sent to Amplitude", () => {
  const event = toAmplitudeEvent({
    type: "settings_child_update",
    childId: "child-private-id",
  });

  assert.deepEqual(event, { name: "Settings Child Updated" });
});

test("chat errors do not send an error message", () => {
  const event = toAmplitudeEvent({
    type: "chat_response_error",
    reason: "private chat context must not be sent",
  });

  assert.deepEqual(event, { name: "Chat Response Failed" });
});

test("mission feedback values are not sent to Amplitude", () => {
  const event = toAmplitudeEvent({ type: "mission_feedback_submit" });

  assert.deepEqual(event, { name: "Mission Feedback Submitted" });
});

test("inquiry submissions do not send title or body", () => {
  const event = toAmplitudeEvent({
    type: "inquiry_submit",
    category: "service_error",
  });

  assert.deepEqual(event, {
    name: "Inquiry Submitted",
    properties: { category: "service_error" },
  });
});

test("uncategorized inquiries fall back to a fixed label", () => {
  const event = toAmplitudeEvent({ type: "inquiry_submit", category: null });

  assert.deepEqual(event, {
    name: "Inquiry Submitted",
    properties: { category: "unspecified" },
  });
});

test("bottom nav taps carry only the tab identifier", () => {
  const event = toAmplitudeEvent({ type: "bottom_nav_tap", tab: "play" });

  assert.deepEqual(event, {
    name: "Bottom Nav Tapped",
    properties: { tab: "play" },
  });
});

test("home play notification nudge clicks have a dedicated Amplitude event", () => {
  const event = toAmplitudeEvent({
    type: "home_play_notification_nudge_click",
  });

  assert.deepEqual(event, {
    name: "Home Play Notification Nudge Clicked",
  });
});

test("home play notification nudge clicks have a dedicated GA event", () => {
  assert.equal(
    toGoogleAnalyticsEventName({
      type: "home_play_notification_nudge_click",
    }),
    "home_play_notification_nudge_click",
  );
  assert.equal(toGoogleAnalyticsEventName({ type: "home_view" }), null);
});

test("mission completion carries where it was completed (detail vs timer)", () => {
  assert.deepEqual(
    toAmplitudeEvent({
      type: "mission_complete",
      completionType: "manual",
      source: "detail_direct",
      entry: "today",
      elapsedSeconds: 312,
    }),
    {
      name: "Mission Completed",
      properties: {
        completion_type: "manual",
        source: "detail_direct",
        entry: "today",
        elapsed_seconds: 312,
      },
    },
  );

  // 값이 없는 프로퍼티(entry, elapsed_seconds)는 보내지 않는다
  assert.deepEqual(
    toAmplitudeEvent({
      type: "mission_complete",
      completionType: "early",
      source: "timer_screen",
    }),
    {
      name: "Mission Completed",
      properties: { completion_type: "early", source: "timer_screen" },
    },
  );
});

test("mission click events record intent before the API call", () => {
  assert.deepEqual(
    toAmplitudeEvent({ type: "mission_timer_start_click", entry: "saved" }),
    { name: "Mission Timer Start Clicked", properties: { entry: "saved" } },
  );
  assert.deepEqual(
    toAmplitudeEvent({
      type: "mission_complete_click",
      source: "timer_screen",
      timerAction: "early_complete",
    }),
    {
      name: "Mission Complete Clicked",
      properties: { source: "timer_screen", timer_action: "early_complete" },
    },
  );
  assert.deepEqual(
    toAmplitudeEvent({ type: "mission_start", startMode: "direct", entry: "today" }),
    { name: "Mission Started", properties: { start_mode: "direct", entry: "today" } },
  );
});
