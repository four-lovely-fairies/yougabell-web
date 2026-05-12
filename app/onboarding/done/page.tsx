"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { track } from "@/lib/analytics";
import { ApiError, api } from "@/lib/api";
import { notifyMobile } from "@/lib/native-bridge";
import type { CompleteOnboardingPayload, OnboardingDraft } from "@/lib/types";

type Status = "submitting" | "success" | "error" | "already";

function buildPayload(
  draft: OnboardingDraft | null,
): CompleteOnboardingPayload | null {
  if (!draft) return null;
  const p = draft.parent;
  const children = draft.children ?? [];
  if (!p?.name || !p.birthDate || !p.gender) return null;
  if (children.length < 1) return null;
  for (const c of children) {
    if (!c.name || !c.birthDate || !c.gender) return null;
  }
  return {
    parent: {
      name: p.name,
      birthDate: p.birthDate,
      gender: p.gender,
      workStatus: p.workStatus ?? null,
    },
    children: children.map((c) => ({
      name: c.name!,
      birthDate: c.birthDate!,
      gender: c.gender!,
      notes: c.notes,
    })),
    appUsage: draft.appUsage ?? [],
  };
}

export default function DonePage() {
  const router = useRouter();
  const { draft, clear } = useOnboardingDraft();
  const payload = useMemo(() => buildPayload(draft), [draft]);
  const [status, setStatus] = useState<Status>("submitting");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!payload) return;
    if (submittedRef.current) return;
    submittedRef.current = true;

    api
      .completeOnboarding(payload)
      .then((me) => {
        clear();
        track({ type: "onboarding_finish" });
        notifyMobile({
          type: "ONBOARDING_COMPLETE",
          payload: { userId: me.id },
        });
        setStatus("success");
        setTimeout(() => router.replace("/"), 800);
      })
      .catch((e: unknown) => {
        if (e instanceof ApiError && e.status === 409) {
          clear();
          setStatus("already");
          setTimeout(() => router.replace("/"), 800);
          return;
        }
        const message =
          e instanceof ApiError ? `서버 오류 (${e.status})` : "네트워크 오류";
        setStatus("error");
        setError(message);
      });
  }, [payload, attempt, clear, router]);

  if (draft && !payload) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center gap-4">
        <div className="text-4xl">⚠️</div>
        <p className="text-zinc-700">
          입력값이 부족합니다. 이전 단계로 돌아가세요.
        </p>
        <button
          type="button"
          onClick={() => router.push("/onboarding/parent")}
          className="h-12 px-6 rounded-xl border border-zinc-300"
        >
          이전 단계로
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center gap-4">
      {status === "submitting" && (
        <>
          <div className="text-4xl">⏳</div>
          <p className="text-zinc-700">저장 중...</p>
        </>
      )}
      {status === "success" && (
        <>
          <div className="text-4xl">🎉</div>
          <p className="text-zinc-700">완료! 홈으로 이동합니다.</p>
        </>
      )}
      {status === "already" && (
        <>
          <div className="text-4xl">✅</div>
          <p className="text-zinc-700">이미 완료된 온보딩입니다.</p>
        </>
      )}
      {status === "error" && (
        <>
          <div className="text-4xl">⚠️</div>
          <p className="text-zinc-700">{error}</p>
          <button
            type="button"
            onClick={() => {
              submittedRef.current = false;
              setStatus("submitting");
              setError(null);
              setAttempt((a) => a + 1);
            }}
            className="h-12 px-6 rounded-xl border border-zinc-300"
          >
            다시 시도
          </button>
          <button
            type="button"
            onClick={() => router.push("/onboarding/parent")}
            className="text-sm text-zinc-500"
          >
            이전 단계로
          </button>
        </>
      )}
    </div>
  );
}
