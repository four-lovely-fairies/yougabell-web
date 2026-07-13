"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { InterestCard } from "@/components/onboarding/interest-card";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import {
  INTEREST_API_TO_WEB,
  INTEREST_EMOJI,
  INTEREST_LABEL,
  INTEREST_WEB_TO_API,
  type InterestId,
} from "@/lib/types";

const MAX_SELECT = 3;
const OPTIONS: InterestId[] = [
  "working-parent",
  "home-care",
  "language",
  "social",
  "physical",
  "cognition",
];

/**
 * 관심사 수정 — Figma 2395:9162.
 * 진입 시 me에서 현재 선택을 받아 초기화하지 않고, 일단 빈 상태로 두고 사용자가 새로 고른다(디자인 카피라이트: "변경 후 관심사를 다시 선택해주세요").
 */
export default function SettingsInterestsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<InterestId[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const me = await api.getMe();
        setSelected((me.interests ?? []).map((id) => INTEREST_API_TO_WEB[id]));
      } catch {
        // hydrate 실패 — 빈 상태로 시작
      }
    })();
  }, []);

  const toggle = (id: InterestId) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECT) return prev;
      return [...prev, id];
    });
  };

  const submit = async () => {
    if (selected.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.updateInterests(selected.map((id) => INTEREST_WEB_TO_API[id]));
      track({ type: "settings_interests_save", count: selected.length });
      router.back();
    } catch (e) {
      const message =
        e instanceof ApiError ? `저장 실패 (${e.status})` : "네트워크 오류";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="flex flex-1 flex-col px-5 pb-[max(20px,env(safe-area-inset-bottom))]"
    >
      <OnboardingHeader variant="back" />

      <header className="flex flex-col gap-2 py-6">
        <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
          관심사 수정
        </h1>
        <p className="text-sm text-gray-500">
          하단의 버튼을 눌러 변경 후 관심사를 다시 선택해주세요.
        </p>
      </header>

      <div className="flex flex-wrap gap-3 py-2">
        {OPTIONS.map((id) => (
          <InterestCard
            key={id}
            emoji={INTEREST_EMOJI[id]}
            label={INTEREST_LABEL[id]}
            selected={selected.includes(id)}
            disabled={selected.length >= MAX_SELECT}
            onToggle={() => toggle(id)}
          />
        ))}
      </div>

      <div className="min-h-8 flex-1" />

      {error ? (
        <p className="pb-2 text-center text-sm text-red-500">{error}</p>
      ) : null}

      <Button
        type="submit"
        size="full"
        disabled={selected.length === 0 || busy}
      >
        {busy ? "저장 중..." : "변경 완료"}
      </Button>
    </form>
  );
}
