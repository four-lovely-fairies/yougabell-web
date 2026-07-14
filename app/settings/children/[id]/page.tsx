"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChildCardForm } from "@/components/onboarding/child-card";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import type { ChildDraft } from "@/lib/types";

/** 자녀 수정 — Figma 2395:9398. */
export default function SettingsChildrenEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const childId = params.id;
  const [child, setChild] = useState<ChildDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const me = await api.getMe();
        const found = me.children.find((c) => c.id === childId);
        if (!found) {
          setError("자녀 정보를 찾을 수 없습니다.");
          return;
        }
        setChild({
          tempId: found.id,
          name: found.name,
          // API는 birthDate를 ISO datetime(...T00:00:00.000Z)으로 주는데
          // 입력 폼·API는 YYYY-MM-DD만 받으므로 날짜 부분만 사용.
          birthDate: found.birthDate.slice(0, 10),
          gender: found.gender,
          notes: found.notes ?? undefined,
        });
      } catch {
        setError("정보를 불러오지 못했습니다.");
      }
    })();
  }, [childId]);

  const canSubmit = Boolean(child?.name && child?.birthDate && child?.gender);

  const submit = async () => {
    if (!child || !canSubmit || busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.updateChild(childId, {
        name: child.name,
        birthDate: child.birthDate,
        gender: child.gender,
        notes: child.notes ?? null,
      });
      track({ type: "settings_child_update", childId });
      router.replace("/settings/children");
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
      className="flex h-dvh flex-col px-5 pb-[max(20px,env(safe-area-inset-bottom))]"
    >
      <OnboardingHeader variant="back" />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <header className="py-6">
          <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
            수정할 아이 정보를
            <br />
            입력해 주세요
          </h1>
        </header>

        {child ? (
          <ChildCardForm index={0} child={child} onChange={setChild} />
        ) : (
          <p className="py-8 text-center text-sm text-gray-400">
            불러오는 중...
          </p>
        )}
      </div>

      <div className="shrink-0">
        {error ? (
          <p className="pb-2 text-center text-sm text-red-500">{error}</p>
        ) : null}

        <Button type="submit" size="full" disabled={!canSubmit || busy}>
          {busy ? "저장 중..." : "수정 완료"}
        </Button>
      </div>
    </form>
  );
}
