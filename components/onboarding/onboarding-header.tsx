"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { HeaderSpacer } from "@/components/app/app-header";
import { ArrowLeftIcon, XIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";
import { useEdgeSwipeBack } from "@/hooks/use-edge-swipe-back";

// 온보딩 진행 단계: 내 프로필 → 관심 주제 → 알림 → 아이 정보.
// (알림 허용 시 들르는 app-usage는 선택 안내라 단계에 세지 않는다)
export const ONBOARDING_STEPS = 4;

type Props = {
  variant?: "back" | "close" | "none";
  onAction?: () => void;
  /** 헤더 오른쪽 텍스트 버튼 (예: 건너뛰기) */
  right?: ReactNode;
  /** 온보딩 진행 단계 — 헤더 바로 아래 얇은 프로그레스바로 표시 */
  progress?: { step: number; total: number };
};

export function OnboardingHeader({
  variant = "back",
  onAction,
  right,
  progress,
}: Props) {
  const router = useRouter();
  const handle = () => {
    if (onAction) onAction();
    else router.back();
  };
  // 뒤로가기 버튼이 있을 때만 왼쪽 가장자리 스와이프로도 같은 동작을 한다.
  useEdgeSwipeBack(handle, variant === "back");

  return (
    <>
      {/* viewport 상단 고정(fixed) — 스크롤·overscroll에도 안 움직인다. */}
      <header className="fixed inset-x-0 top-0 z-30 mx-auto w-full max-w-107.5 bg-white px-5 pt-safe">
        <div className="flex h-14 items-center">
          {variant === "back" ? (
            <IconButton label="이전 단계로" onClick={handle}>
              <ArrowLeftIcon />
            </IconButton>
          ) : null}
          {variant === "close" ? (
            <div className="ml-auto">
              <IconButton label="닫기" onClick={handle}>
                <XIcon />
              </IconButton>
            </div>
          ) : null}
          {right ? <div className="ml-auto">{right}</div> : null}
        </div>
        {progress ? (
          <div
            role="progressbar"
            aria-label="온보딩 진행"
            aria-valuemin={1}
            aria-valuemax={progress.total}
            aria-valuenow={progress.step}
            className="h-1 overflow-hidden rounded-full bg-gray-100"
          >
            <div
              className="h-full rounded-full bg-primary-300 transition-[width] duration-500 ease-out motion-reduce:transition-none"
              style={{ width: `${(progress.step / progress.total) * 100}%` }}
            />
          </div>
        ) : null}
      </header>
      {/* 헤더가 fixed라 인플로우에서 빠진 높이를 스페이서로 보충(콘텐츠를 헤더 아래로). */}
      <HeaderSpacer />
      {progress ? <div aria-hidden className="h-1 shrink-0" /> : null}
    </>
  );
}
