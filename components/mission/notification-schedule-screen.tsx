"use client";

import { useState } from "react";
import { NotificationSlotPicker } from "@/components/onboarding/notification-slot-picker";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { NotificationPreference } from "@/lib/types";

function isValid(
  preference: NotificationPreference | null,
): preference is NotificationPreference {
  return Boolean(
    preference && (preference.slot !== "custom" || preference.time),
  );
}

export function NotificationScheduleScreen({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: () => void;
}) {
  const [preference, setPreference] = useState<NotificationPreference | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!isValid(preference) || saving) return;

    setSaving(true);
    try {
      await Promise.all([
        api.upsertNotificationPreference("play_10min", {
          enabled: true,
          time: preference.time,
        }),
        api.upsertNotificationPreference("weekly_report", {
          enabled: true,
        }),
      ]);
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] text-gray-800">
      <OnboardingHeader variant="close" onAction={onClose} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <header className="mt-2 mb-6 flex flex-col gap-2">
          <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
            알림을 받고싶으신
            <br />
            시간대를 선택해 주세요
          </h1>
          <p className="text-sm leading-[1.4] text-gray-500">
            주간 리포트, 하루 10분 놀이 등
            <br />
            육아에 필요한 정보 알림만 보내드려요.
          </p>
        </header>

        <NotificationSlotPicker value={preference} onChange={setPreference} />
      </div>

      <div className="shrink-0">
        <Button
          size="full"
          onClick={submit}
          disabled={!isValid(preference) || saving}
        >
          {saving ? "저장 중..." : "알림 설정완료"}
        </Button>
      </div>
    </div>
  );
}
