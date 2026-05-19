import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildOAuthRedirectTo, getOAuthErrorMessage } from "./auth-oauth";

void describe("auth oauth helpers", () => {
  void it("builds the shared callback url with next preserved", () => {
    assert.equal(
      buildOAuthRedirectTo("https://yougabell.app", "/onboarding/parent"),
      "https://yougabell.app/auth/callback?next=%2Fonboarding%2Fparent",
    );
  });

  void it("returns a provider-neutral failure message", () => {
    assert.equal(
      getOAuthErrorMessage("oauth_failed"),
      "로그인 연결에 실패했습니다. 다시 시도해주세요.",
    );
  });

  void it("returns a generic error message for unknown callback errors", () => {
    assert.equal(
      getOAuthErrorMessage("unexpected"),
      "로그인 처리 중 문제가 발생했습니다.",
    );
  });

  void it("returns null when there is no callback error", () => {
    assert.equal(getOAuthErrorMessage(null), null);
  });
});
