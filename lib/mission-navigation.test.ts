import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { goBackFromMissionTimer } from "./mission-navigation";

void describe("mission navigation", () => {
  void it("uses browser history when returning from timer to prevent intro/timer loops", () => {
    const calls: string[] = [];

    goBackFromMissionTimer({
      router: {
        push: (href) => calls.push(`push:${href}`),
      },
      history: {
        length: 2,
        back: () => calls.push("back"),
      },
    });

    assert.deepEqual(calls, ["back"]);
  });

  void it("falls back to the mission intro when there is no browser history", () => {
    const calls: string[] = [];

    goBackFromMissionTimer({
      router: {
        push: (href) => calls.push(`push:${href}`),
      },
      history: {
        length: 1,
        back: () => calls.push("back"),
      },
    });

    assert.deepEqual(calls, ["push:/mission"]);
  });
});
