import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getOnboardingResumePath,
  mergeOnboardingDraft,
} from "./onboarding-draft";
import type { OnboardingDraft } from "./types";

const BASE_DRAFT: OnboardingDraft = {
  schemaVersion: 3,
  lastStep: "interest",
  parent: {
    name: "홍길동",
    birthDate: "1990-01-01",
    gender: "female",
    workStatus: "working",
  },
  consents: {
    service: true,
    privacy: true,
    marketing: false,
  },
  children: [
    {
      tempId: "child-1",
      name: "아이",
      birthDate: "2024-01-01",
      gender: "male",
      notes: "memo",
    },
  ],
  interests: ["working-parent", "language"],
  notification: {
    slot: "morning",
    time: "08:00",
  },
  notificationPermission: "granted",
  updatedAt: "2026-05-29T00:00:00.000Z",
};

void describe("mergeOnboardingDraft", () => {
  void it("기존 초안의 관심사와 동의, 알림 권한을 유지한다", () => {
    const merged = mergeOnboardingDraft(BASE_DRAFT, {
      lastStep: "children",
      children: BASE_DRAFT.children,
    });

    assert.deepEqual(merged.interests, BASE_DRAFT.interests);
    assert.deepEqual(merged.consents, BASE_DRAFT.consents);
    assert.equal(
      merged.notificationPermission,
      BASE_DRAFT.notificationPermission,
    );
  });
});

void describe("getOnboardingResumePath", () => {
  void it("저장된 마지막 단계에 맞는 resume path를 반환한다", () => {
    assert.equal(getOnboardingResumePath(BASE_DRAFT), "/onboarding/interest");
    assert.equal(
      getOnboardingResumePath({ ...BASE_DRAFT, lastStep: "children" }),
      "/onboarding/children",
    );
    assert.equal(getOnboardingResumePath(null), "/onboarding/parent");
  });
});
