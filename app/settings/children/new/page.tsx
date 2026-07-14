"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChildCardForm } from "@/components/onboarding/child-card";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import type { ChildDraft } from "@/lib/types";
import { newTempId } from "@/lib/utils";

/** 자녀 추가 — Figma 2395:9454. */
export default function SettingsChildrenNewPage() {
  const router = useRouter();
  const [child, setChild] = useState<ChildDraft>({ tempId: newTempId() });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(child.name && child.birthDate && child.gender);

  const submit = async () => {
    if (!canSubmit || busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.addChild({
        name: child.name!,
        birthDate: child.birthDate!,
        gender: child.gender!,
        notes: child.notes ?? null,
      });
      track({ type: "settings_child_add" });
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
            아이 정보를
            <br />
            입력해 주세요
          </h1>
        </header>

        <ChildCardForm index={0} child={child} onChange={setChild} />
      </div>

      <div className="shrink-0">
        {error ? (
          <p className="pb-2 text-center text-sm text-red-500">{error}</p>
        ) : null}

        <Button type="submit" size="full" disabled={!canSubmit || busy}>
          {busy ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  );
}
