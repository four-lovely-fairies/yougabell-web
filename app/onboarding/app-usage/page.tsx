"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppUsageMatrix } from "@/components/onboarding/app-usage-matrix";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { track } from "@/lib/analytics";
import type { AppUsageSlot } from "@/lib/types";

export default function AppUsagePage() {
  const router = useRouter();
  const { draft, patch } = useOnboardingDraft();
  const [slots, setSlots] = useState<AppUsageSlot[]>(draft?.appUsage ?? []);

  const back = () => router.push("/onboarding/children");
  const submit = () => {
    patch({ appUsage: slots, lastStep: "app-usage" });
    track({ type: "onboarding_step_complete", step: "app_usage" });
    router.push("/onboarding/done");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col flex-1 gap-6"
    >
      <header>
        <h1 className="text-2xl font-semibold">앱 사용 시간대</h1>
        <p className="text-sm text-zinc-600 mt-1">
          요일별로 앱 알림을 받기 좋은 시간대를 선택해주세요.
        </p>
        <p className="text-xs text-amber-700 mt-2">
          ⚠ 디자인 재검토 중 — 매트릭스 UI는 placeholder입니다.
        </p>
      </header>

      <AppUsageMatrix value={slots} onChange={setSlots} />

      <div className="flex-1" />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={back}
          className="flex-1 h-14 rounded-2xl border border-zinc-300 text-zinc-700 font-medium"
        >
          이전
        </button>
        <button
          type="submit"
          className="flex-1 h-14 rounded-2xl bg-zinc-900 text-white font-medium"
        >
          완료
        </button>
      </div>
    </form>
  );
}
