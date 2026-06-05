"use client";

import { useRouter } from "next/navigation";
import { HeaderSpacer } from "@/components/app/app-header";
import { ArrowLeftIcon, XIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";

type Props = {
  variant?: "back" | "close" | "none";
  onAction?: () => void;
};

export function OnboardingHeader({ variant = "back", onAction }: Props) {
  const router = useRouter();
  const handle = () => {
    if (onAction) onAction();
    else router.back();
  };

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
        </div>
      </header>
      {/* 헤더가 fixed라 인플로우에서 빠진 높이를 스페이서로 보충(콘텐츠를 헤더 아래로). */}
      <HeaderSpacer />
    </>
  );
}
