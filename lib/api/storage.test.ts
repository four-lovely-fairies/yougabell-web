import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  SELECTED_CHILD_COOKIE,
  clearSelectedChildIdIfMatches,
  clearStoredSelectedChildId,
  getStoredSelectedChildId,
  setStoredSelectedChildId,
} from "./storage";

const originalDocument = globalThis.document;
const originalLocation = globalThis.location;

afterEach(() => {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: originalDocument,
  });
  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: originalLocation,
  });
});

void describe("selected child cookie", () => {
  void it("ignores legacy localStorage and uses the default child when cookie is absent", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { cookie: "other=1" },
    });
    assert.equal(getStoredSelectedChildId(), null);
  });

  void it("writes a secure, child-scoped selection readable by server requests", () => {
    let written = "";
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        get cookie() {
          return written;
        },
        set cookie(value: string) {
          written = value;
        },
      },
    });
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: { protocol: "https:" },
    });

    setStoredSelectedChildId("child-1");
    assert.match(written, /Path=\/; SameSite=Lax; Secure/);
    assert.equal(getStoredSelectedChildId(), "child-1");
    clearStoredSelectedChildId();
    assert.match(written, /Max-Age=0/);
  });

  void it("clears only the deleted child selection", () => {
    let written = `${SELECTED_CHILD_COOKIE}=child-1`;
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        get cookie() {
          return written;
        },
        set cookie(value: string) {
          written = value;
        },
      },
    });

    assert.equal(clearSelectedChildIdIfMatches("child-2"), false);
    assert.equal(written, `${SELECTED_CHILD_COOKIE}=child-1`);
    assert.equal(clearSelectedChildIdIfMatches("child-1"), true);
    assert.match(written, /Max-Age=0/);
  });
});
