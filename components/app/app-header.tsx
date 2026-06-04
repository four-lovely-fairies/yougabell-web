"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

// 공통 Sub LNB 헤더 (전 화면). Figma: h56, bg white.
// - back: 좌 back 버튼 + 중앙 타이틀(SemiBold 16 #191f28) + 우측 액션 슬롯
// - dashboard: 좌 자녀 셀렉터(left) + 우측 액션(설정/알림 등)
type Props = {
  variant?: "back" | "dashboard";
  title?: string;
  onBack?: () => void;
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
};

export const AppHeader = ({
  variant = "back",
  title,
  onBack,
  left,
  right,
  className,
}: Props) => {
  const router = useRouter();
  const handleBack = () => (onBack ? onBack() : router.back());

  return (
    // pt-safe로 OS 상태바 안전영역을 헤더가 직접 책임진다 (Figma StatusBar 47px 하드코딩 제거).
    // 좌우 패딩은 20px(px-5)로 통일 — 어느 화면이든 버튼 위치가 일정하게 노출된다.
    <header
      className={cn("sticky top-0 z-30 shrink-0 bg-white pt-safe", className)}
    >
      <div className="relative flex h-14 items-center px-5">
        {variant === "back" ? (
          <IconButton label="뒤로" onClick={handleBack}>
            <ArrowLeftIcon />
          </IconButton>
        ) : (
          left
        )}

        {title ? (
          <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold leading-[1.4] text-[#191f28]">
            {title}
          </h1>
        ) : null}

        {right ? (
          <div className="ml-auto flex items-center">{right}</div>
        ) : null}
      </div>
    </header>
  );
};
