"use client";

import { useRouter } from "next/navigation";
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
    <div className="h-14 flex items-center">
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
  );
}
