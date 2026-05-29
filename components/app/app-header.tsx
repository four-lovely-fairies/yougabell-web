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
    <header
      className={cn(
        "relative flex h-14 shrink-0 items-center bg-white",
        variant === "back" ? "px-4" : "px-5",
        className,
      )}
    >
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

      {right ? <div className="ml-auto flex items-center">{right}</div> : null}
    </header>
  );
};
