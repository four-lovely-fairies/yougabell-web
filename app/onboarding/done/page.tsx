"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
  const notification = draft.notification;
  if (!p?.name || !p.birthDate || !p.gender) return null;
  if (children.length < 1) return null;
  for (const c of children) {
    if (!c.name || !c.birthDate || !c.gender) return null;
  }
  // v4 흐름: 알림 거부(notificationPermission==="denied") 시 시간대 없음. notification 옵셔널.
  if (notification?.slot === "custom" && !notification.time) return null;
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
    notification: notification ?? undefined,
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
        <p className="text-gray-700">
          입력값이 부족합니다. 이전 단계로 돌아가세요.
        </p>
        <Button onClick={() => router.replace("/onboarding/app-usage")}>
          이전 단계로
        </Button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center gap-4">
        <p className="text-gray-700">{error}</p>
        <Button
          onClick={() => {
            submittedRef.current = false;
            setStatus("submitting");
            setError(null);
            setAttempt((a) => a + 1);
          }}
        >
          다시 시도
        </Button>
        <button
          type="button"
          onClick={() => router.replace("/onboarding/app-usage")}
          className="text-sm text-gray-500"
        >
          이전 단계로
        </button>
      </div>
    );
  }

  // Figma 2146:4771 — 배경 ellipse 데코 + 헤더 + 4 dots 펄스
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-32 size-[349px] rounded-full bg-primary-100 opacity-60 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-[252px] h-[253px] w-[564px] rounded-full bg-primary-100 opacity-50 blur-3xl"
      />

      <div className="relative z-10 flex flex-col gap-2">
        <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
          {status === "already" ? (
            "이미 완료된 온보딩입니다"
          ) : status === "success" ? (
            "준비가 끝났어요"
          ) : (
            <>
              맞춤 미션과 마일스톤을
              <br />
              생성하고 있어요
            </>
          )}
        </h1>
        <p className="text-sm text-gray-500">잠시만 기다려주세요!</p>
      </div>
      <div className="relative z-10">
        <LoadingDots />
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-2" aria-label="로딩 중" role="status">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="size-2 rounded-full bg-primary-500 motion-safe:animate-pulse"
          style={{
            opacity: 0.3 + i * 0.2,
            animationDelay: `${i * 160}ms`,
          }}
        />
      ))}
    </div>
  );
}
