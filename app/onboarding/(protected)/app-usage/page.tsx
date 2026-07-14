"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NotificationSlotPicker } from "@/components/onboarding/notification-slot-picker";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { track } from "@/lib/analytics";
import type { NotificationPreference } from "@/lib/types";

function isValid(
  pref: NotificationPreference | null,
): pref is NotificationPreference {
  if (!pref) return false;
  if (pref.slot === "custom") return Boolean(pref.time);
  return true;
}

export default function AppUsagePage() {
  const router = useRouter();
  const { draft, patch } = useOnboardingDraft();
  const [pref, setPref] = useState<NotificationPreference | null>(
    draft?.notification ?? null,
  );

  // 디자인 2146:4530은 우상단 X만 노출 (back 없음). X는 시간대 skip → 자녀 정보로 직행.
  const close = () => {
    patch({ notificationPermission: "denied", lastStep: "app-usage" });
    router.push("/onboarding/children");
  };
  const submit = () => {
    if (!isValid(pref)) return;
    patch({ notification: pref, lastStep: "app-usage" });
    track({ type: "onboarding_step_complete", step: "app_usage" });
    router.push("/onboarding/children");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <OnboardingHeader variant="close" onAction={close} />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <header className="mt-2 mb-6 flex flex-col gap-2">
          <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
            알림을 받고싶으신
            <br />
            시간대를 선택해 주세요
          </h1>
          <p className="text-sm text-gray-500 leading-[1.4]">
            주간 리포트, 하루 10분 놀이 등
            <br />
            육아에 필요한 정보 알림만 보내드려요.
          </p>
        </header>

        <NotificationSlotPicker value={pref} onChange={setPref} />
      </div>

      <div className="shrink-0">
        <Button type="submit" size="full" disabled={!isValid(pref)}>
          알림 설정완료
        </Button>
      </div>
    </form>
  );
}
