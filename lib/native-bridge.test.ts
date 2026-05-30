import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseNativeMessage } from "./native-bridge";

void describe("native bridge parser", () => {
  void it("accepts a session sync payload", () => {
    assert.deepEqual(
      parseNativeMessage({
        type: "SUPABASE_SESSION_SYNC",
        payload: {
          accessToken: "access-token",
          refreshToken: "refresh-token",
        },
      }),
      {
        type: "SUPABASE_SESSION_SYNC",
        payload: {
          accessToken: "access-token",
          refreshToken: "refresh-token",
        },
      },
    );
  });

  void it("rejects malformed session sync payloads", () => {
    assert.equal(
      parseNativeMessage({
        type: "SUPABASE_SESSION_SYNC",
        payload: { accessToken: "access-token" },
      }),
      null,
    );
  });

  void it("accepts a native google error payload", () => {
    assert.deepEqual(
      parseNativeMessage({
        type: "NATIVE_GOOGLE_SIGN_IN_ERROR",
        payload: { message: "로그인 실패" },
      }),
      {
        type: "NATIVE_GOOGLE_SIGN_IN_ERROR",
        payload: { message: "로그인 실패" },
      },
    );
  });

  void it("accepts a native apple error payload", () => {
    assert.deepEqual(
      parseNativeMessage({
        type: "NATIVE_APPLE_SIGN_IN_ERROR",
        payload: { message: "로그인 실패" },
      }),
      {
        type: "NATIVE_APPLE_SIGN_IN_ERROR",
        payload: { message: "로그인 실패" },
      },
    );
  });

  void it("accepts a native push permission result", () => {
    assert.deepEqual(
      parseNativeMessage({
        type: "NATIVE_PUSH_PERMISSION_RESULT",
        payload: { permission: "denied" },
      }),
      {
        type: "NATIVE_PUSH_PERMISSION_RESULT",
        payload: { permission: "denied" },
      },
    );
  });

  void it("accepts a native push permission status payload", () => {
    assert.deepEqual(
      parseNativeMessage({
        type: "NATIVE_PUSH_PERMISSION_STATUS",
        payload: { permission: "granted" },
      }),
      {
        type: "NATIVE_PUSH_PERMISSION_STATUS",
        payload: { permission: "granted" },
      },
    );
  });
});
