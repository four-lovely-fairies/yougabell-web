"use client";

import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

// fixed 헤더 높이만큼 콘텐츠를 내리는 스페이서 (미션 화면용 re-export).
export { HeaderSpacer } from "@/components/app/app-header";

// Figma 미션 시작하기(2470:5718) 실측 캐릭터 에셋.
export const MISSION_IMAGE_PATH = "/images/figma/mission/mission-character.png";
export const MISSION_META_ICONS = {
  time: "/icons/figma/mission/alarm.svg",
  category: "/icons/figma/mission/folder.svg",
  source: "/icons/figma/mission/source.svg",
  goal: "/icons/figma/mission/goal.svg",
} as const;
export const FEEDBACK_ICON_PATHS = [
  "/icons/figma/mission-feedback/very-bad.svg",
  "/icons/figma/mission-feedback/bad.svg",
  "/icons/figma/mission-feedback/neutral.svg",
  "/icons/figma/mission-feedback/good.svg",
  "/icons/figma/mission-feedback/very-good.svg",
] as const;

export function MissionHeader({
  childLabel,
  onBack,
  onSwitchChild,
}: {
  childLabel: string;
  onBack: () => void;
  /** 전달 시 자녀 라벨이 자녀 변경 트리거 버튼이 된다. 미전달 시 정적 표시. */
  onSwitchChild?: () => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 mx-auto w-full max-w-107.5 bg-gradient-to-b from-[#fbfbfb] via-[#fbfbfb] to-[#fbfbfb]/0 px-5 pt-safe">
      <div className="relative flex h-14 items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex size-11 items-center justify-center text-gray-800"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="size-6" aria-hidden />
        </button>
        {onSwitchChild ? (
          <button
            type="button"
            onClick={onSwitchChild}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium leading-normal text-gray-800 transition-colors hover:bg-gray-50 active:bg-gray-100"
            aria-haspopup="dialog"
          >
            <span className="max-w-50 truncate">{childLabel}</span>
            <ChevronDown className="size-4 shrink-0" aria-hidden />
          </button>
        ) : (
          // 전환할 자녀가 1명뿐이면 드롭다운 화살표를 숨겨 정적 라벨로만 표시.
          <div className="flex items-center text-sm font-medium leading-normal text-gray-800">
            <span className="max-w-50 truncate">{childLabel}</span>
          </div>
        )}
        <div className="size-11 opacity-0" aria-hidden />
      </div>
    </header>
  );
}

export function MissionMetaRow({
  icon,
  label,
  value,
  onClick,
}: {
  icon?: string;
  label: string;
  value: ReactNode;
  /** 전달 시 값 우측에 chevron이 붙고 행 전체가 버튼이 된다(예: 출처 자세히). */
  onClick?: () => void;
}) {
  const labelEl = (
    <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium leading-[1.4] text-gray-500">
      {icon ? <img src={icon} alt="" className="size-5" aria-hidden /> : null}
      {label}
    </span>
  );
  // 긴 출처 인용(논문 등)이 한 줄을 넘겨 레이아웃을 깨지 않도록 값은 말줄임.
  // 전체 텍스트는 "출처 자세히 보기" 시트에서 확인한다.
  const valueEl = (
    <span className="flex min-w-0 flex-1 items-center justify-end gap-0.5 text-sm font-bold leading-[1.4] text-gray-800">
      <span className="truncate">{value}</span>
      {onClick ? (
        <ChevronRight className="size-5 shrink-0 text-gray-400" aria-hidden />
      ) : null}
    </span>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-3"
      >
        {labelEl}
        {valueEl}
      </button>
    );
  }
  return (
    <div className="flex items-center justify-between gap-3">
      {labelEl}
      {valueEl}
    </div>
  );
}

export type MissionSwitchChild = {
  id: string;
  name: string;
  ageLabel: string;
};

/** birthDate(YYYY-MM-DD) → "만N세". 서버 ageLabel이 없는 자녀 목록(getMe)용 근사치. */
export function ageLabelFromBirth(birthDate: string): string {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return "";
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return `만${Math.max(0, age)}세`;
}

/** 헤더 자녀 라벨 아래로 펼쳐지는 자녀 변경 드롭다운(Figma 미션 시작하기 헤더). */
export function ChildSwitchDropdown({
  childItems,
  selectedChildId,
  onSelect,
  onClose,
}: {
  childItems: MissionSwitchChild[];
  selectedChildId: string;
  onSelect: (child: MissionSwitchChild) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40"
      role="dialog"
      aria-modal="true"
      aria-label="자녀 선택"
      onClick={onClose}
    >
      <div className="relative mx-auto h-full w-full max-w-107.5">
        <div
          className="-translate-x-1/2 absolute left-1/2 top-[calc(env(safe-area-inset-top)+56px)] w-60 overflow-hidden rounded-3xl border border-[#ebecf0] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
          onClick={(event) => event.stopPropagation()}
        >
          {childItems.map((child) => {
            const selected = child.id === selectedChildId;
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => onSelect(child)}
                className={`flex w-full items-center justify-between px-5 py-4 text-left ${
                  selected ? "bg-primary-50" : "bg-white"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold leading-[1.4] text-gray-800">
                    {child.name}
                  </span>
                  <span className="block truncate text-xs font-normal leading-[1.4] text-gray-500">
                    {child.ageLabel}
                  </span>
                </span>
                {selected ? (
                  <span className="ml-3 size-2 shrink-0 rounded-full bg-primary-300" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** 출처 자세히 보기 — 하단 시트로 인용 출처를 안내(Figma 미션 출처). */
export function MissionSourceSheet({
  sourceLabel,
  onClose,
}: {
  sourceLabel: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-[rgba(0,0,0,0.32)]"
      role="dialog"
      aria-modal="true"
      aria-label="미션 출처"
      onClick={onClose}
    >
      <div className="mx-auto w-full max-w-107.5">
        <div
          className="rounded-t-[28px] bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-6"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-gray-200" />
          <h2 className="text-lg font-bold leading-[1.4] text-gray-800">
            미션 출처
          </h2>
          <p className="mt-2 text-sm leading-[1.6] text-gray-600">
            이 미션은 공신력 있는 아동 발달 가이드라인을 근거로 구성했어요.
          </p>
          <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3">
            <p className="text-xs font-medium leading-[1.4] text-gray-500">
              출처
            </p>
            <p className="mt-1 text-sm font-bold leading-[1.4] text-gray-800">
              {sourceLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 flex h-13 w-full items-center justify-center rounded-2xl bg-gray-100 text-base font-medium leading-[1.4] text-gray-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export function TimerRing({ progress }: { progress: number }) {
  const outerSize = 273;
  const ringThickness = 26;
  const safeProgress = Math.max(0, Math.min(1, progress));
  const angle = safeProgress * 360;
  const knobRadians = (180 + angle) * (Math.PI / 180);
  const center = outerSize / 2;
  const radius = center - ringThickness / 2;
  const knobX = center + Math.cos(knobRadians) * radius;
  const knobY = center + Math.sin(knobRadians) * radius;

  return (
    <div className="relative size-68.25">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from -90deg, var(--color-primary-300) 0deg, var(--color-primary-300) ${angle}deg, #efefef ${angle}deg, #efefef 360deg)`,
          filter: "drop-shadow(0 0 12px rgba(149,114,255,0.2))",
        }}
      />
      <div className="absolute inset-6.5 rounded-full bg-[#fbfbfb] shadow-[inset_0_0_3px_rgba(0,0,0,0.04)]" />
      <div
        className="absolute size-7.25 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#a88dff] bg-white"
        style={{ left: knobX, top: knobY }}
      />
    </div>
  );
}

export function MissionIntroSkeleton() {
  return (
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-5 pt-safe">
      <div className="h-14 animate-pulse rounded-2xl bg-[#f2f2f2]" />
      <div className="mt-10 space-y-5">
        <div className="mx-auto h-23 w-27.5 animate-pulse rounded-[24px] bg-[#f2f2f2]" />
        <div className="mx-auto h-8 w-48 animate-pulse rounded-full bg-[#f2f2f2]" />
        <div className="h-32.5 animate-pulse rounded-[24px] bg-[#f2f2f2]" />
        <div className="h-42 animate-pulse rounded-[24px] bg-[#f2f2f2]" />
      </div>
    </div>
  );
}

export function MissionTimerSkeleton() {
  return (
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-5 pt-safe">
      <div className="h-14 animate-pulse rounded-2xl bg-[#f2f2f2]" />
      <div className="flex min-h-[calc(100dvh-103px)] items-center justify-center">
        <div className="size-68.25 animate-pulse rounded-full bg-[#f2f2f2]" />
      </div>
    </div>
  );
}

export function MissionContentSkeleton() {
  return (
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-5 pt-safe">
      <div className="h-14 animate-pulse rounded-2xl bg-[#f2f2f2]" />
      <div className="mt-10 space-y-5">
        <div className="mx-auto h-8 w-44 animate-pulse rounded-full bg-[#f2f2f2]" />
        <div className="mx-auto h-33 w-39.5 animate-pulse rounded-[28px] bg-[#f2f2f2]" />
        <div className="h-45 animate-pulse rounded-[28px] bg-[#f2f2f2]" />
      </div>
    </div>
  );
}

export function MissionErrorState({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-5 pt-safe">
      <div className="flex min-h-[calc(100dvh-47px)] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm leading-[1.6] text-[#666]">{message}</p>
        <button
          type="button"
          onClick={onBack}
          className="rounded-full bg-gray-800 px-5 py-3 text-sm font-medium text-white"
        >
          돌아가기
        </button>
      </div>
    </div>
  );
}
