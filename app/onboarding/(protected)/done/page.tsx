"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { track } from "@/lib/analytics";
import { ApiError, api } from "@/lib/api";
import { notifyMobile } from "@/lib/native-bridge";
import {
  INTEREST_WEB_TO_API,
  type CompleteOnboardingPayload,
  type OnboardingDraft,
} from "@/lib/types";

type Status = "submitting" | "success" | "error" | "already" | "timeout";

const SUBMIT_TIMEOUT_MS = 15_000;

function buildPayload(
  draft: OnboardingDraft | null,
): CompleteOnboardingPayload | null {
  if (!draft) return null;
  const p = draft.parent;
  const children = draft.children ?? [];
  const notification = draft.notification;
  const interests = draft.interests ?? [];
  if (!p?.name || !p.birthDate || !p.gender) return null;
  if (children.length < 1) return null;
  for (const c of children) {
    if (!c.name || !c.birthDate || !c.gender) return null;
  }
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
    interests: interests.map((id) => INTEREST_WEB_TO_API[id]),
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

  const navigateToHome = useEffectEvent(() => {
    // 온보딩 완료 직후에는 서버의 onboardedAt 판정이 바뀌므로
    // App Router client transition 대신 전체 문서 이동으로 최신 세션/서버 상태를 읽게 한다.
    window.location.replace("/");
  });

  useEffect(() => {
    if (!payload) return;
    if (submittedRef.current) return;
    submittedRef.current = true;

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      setStatus("timeout");
    }, SUBMIT_TIMEOUT_MS);

    api
      .completeOnboarding(payload)
      .then((me) => {
        if (cancelled) return;
        window.clearTimeout(timeoutId);
        clear();
        track({ type: "onboarding_finish" });
        notifyMobile({
          type: "ONBOARDING_COMPLETE",
          payload: { userId: me.id },
        });
        setStatus("success");
        setTimeout(() => navigateToHome(), 800);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        window.clearTimeout(timeoutId);
        if (e instanceof ApiError && e.status === 409) {
          clear();
          setStatus("already");
          setTimeout(() => navigateToHome(), 800);
          return;
        }
        const message =
          e instanceof ApiError ? `서버 오류 (${e.status})` : "네트워크 오류";
        setStatus("error");
        setError(message);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [payload, attempt, clear, router]);

  const retry = () => {
    submittedRef.current = false;
    setStatus("submitting");
    setError(null);
    setAttempt((a) => a + 1);
  };

  if (draft && !payload) {
    return (
      <LoadingScreen variant="error">
        <p className="text-gray-700">
          입력값이 부족합니다. 이전 단계로 돌아가세요.
        </p>
        <Button onClick={() => router.replace("/onboarding/children")}>
          이전 단계로
        </Button>
      </LoadingScreen>
    );
  }

  if (status === "error" || status === "timeout") {
    const title =
      status === "timeout"
        ? "응답이 너무 오래 걸려요"
        : "저장 중 문제가 발생했어요";
    const desc =
      status === "timeout"
        ? "네트워크 상태를 확인하고 다시 시도해주세요."
        : (error ?? "잠시 후 다시 시도해주세요.");
    return (
      <LoadingScreen variant="error">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500">{desc}</p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-[280px]">
          <Button size="full" onClick={retry}>
            다시 시도
          </Button>
          <button
            type="button"
            onClick={() => router.replace("/onboarding/children")}
            className="h-12 text-sm font-medium text-gray-500"
          >
            이전 단계로
          </button>
        </div>
      </LoadingScreen>
    );
  }

  return (
    <LoadingScreen>
      <div className="flex flex-col items-center gap-5">
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
        <p className="text-sm font-medium text-gray-500">잠시만 기다려주세요!</p>
      </div>
      <div className="mt-10">
        <LoadingDots />
      </div>
    </LoadingScreen>
  );
}

/**
 * 로딩 화면 컨테이너 — Figma 2146:4771.
 * 보라 ellipse 2개를 배경에 흩뿌리고 콘텐츠를 중앙 정렬.
 */
function LoadingScreen({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "error";
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      {/* 큰 ellipse: 좌상단 회전 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-32 size-[420px] -rotate-6 rounded-full bg-primary-200/60 blur-[80px]"
      />
      {/* 큰 ellipse: 중앙 하단 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 h-[260px] w-[564px] rounded-full bg-primary-100/70 blur-[80px]"
      />
      <div
        className={cnVariant(
          "relative z-10 flex flex-col items-center",
          variant === "default" ? "gap-10" : "gap-6",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function cnVariant(...parts: string[]): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Figma 2146:4781 Group 33924 — 작은 점 4개, 오른쪽으로 갈수록 진해지는 wave 효과.
 */
function LoadingDots() {
  return (
    <div className="flex items-center gap-2" aria-label="로딩 중" role="status">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-primary-500 motion-safe:animate-pulse"
          style={{
            opacity: 0.3 + i * 0.2,
            animationDelay: `${i * 180}ms`,
            animationDuration: "1.2s",
          }}
        />
      ))}
    </div>
  );
}
