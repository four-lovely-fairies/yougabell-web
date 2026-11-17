"use client";

import { XIcon } from "@/components/icons";
import type { ReactNode } from "react";

// 공통 바텀시트 — "시간대를 선택해 주세요" 시트와 같은 모양.
// 손잡이 바 없이 제목 + 오른쪽 X 버튼, 위 모서리 24px, 옅은 딤. 딤을 누르거나 X로 닫는다.
export function BottomSheet({
  title,
  description,
  onClose,
  children,
  labelledById,
  titleAccessory,
}: {
  title: string;
  /** 제목 바로 옆에 붙는 작은 아이콘 등 */
  titleAccessory?: ReactNode;
  /** 제목 아래 보조 설명 */
  description?: string;
  onClose: () => void;
  children: ReactNode;
  /** 제목 요소 id (여러 시트가 동시에 있을 때 구분용) */
  labelledById?: string;
}) {
  const titleId = labelledById ?? "bottom-sheet-title";
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label="닫기"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 animate-dissolve cursor-default bg-black/20 motion-reduce:animate-none"
        style={{ animationDuration: "200ms" }}
      />
      <div className="relative flex max-h-[85dvh] w-full max-w-97.5 animate-sheet-up flex-col rounded-t-3xl bg-white pb-[max(20px,env(safe-area-inset-bottom))] pt-7 motion-reduce:animate-none">
        <header className="flex shrink-0 items-start justify-between gap-3 px-6 pb-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2
              id={titleId}
              className="flex items-center gap-1 text-lg font-bold leading-[1.4] text-gray-800"
            >
              {title}
              {titleAccessory}
            </h2>
            {description ? (
              <p className="text-sm leading-[1.4] text-gray-500">{description}</p>
            ) : null}
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="shrink-0">
            <XIcon size={24} />
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
