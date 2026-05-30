import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAppRedirectPath, getOnboardingRedirectPath } from "./auth-routing";

void describe("auth routing", () => {
  void it("allows the onboarding intro without a session", () => {
    assert.equal(
      getOnboardingRedirectPath({
        pathname: "/onboarding",
        hasSession: false,
        onboardedAt: null,
      }),
      null,
    );
  });

  void it("redirects unauthenticated onboarding steps back to the intro", () => {
    assert.equal(
      getOnboardingRedirectPath({
        pathname: "/onboarding/parent",
        hasSession: false,
        onboardedAt: null,
      }),
      "/onboarding",
    );
  });

  void it("redirects onboarded users away from onboarding", () => {
    assert.equal(
      getOnboardingRedirectPath({
        pathname: "/onboarding/parent",
        hasSession: true,
        onboardedAt: "2026-05-19T00:00:00.000Z",
      }),
      "/",
    );
  });

  void it("redirects unauthenticated app access to the intro", () => {
    assert.equal(
      getAppRedirectPath({
        hasSession: false,
        onboardedAt: null,
      }),
      "/onboarding",
    );
  });

  void it("redirects authenticated but non-onboarded app access to the intro", () => {
    assert.equal(
      getAppRedirectPath({
        hasSession: true,
        onboardedAt: null,
      }),
      "/onboarding",
    );
  });

  void it("allows onboarded app access", () => {
    assert.equal(
      getAppRedirectPath({
        hasSession: true,
        onboardedAt: "2026-05-19T00:00:00.000Z",
      }),
      null,
    );
  });
});
