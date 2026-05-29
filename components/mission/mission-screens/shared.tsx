"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";

export const MISSION_IMAGE_PATH = "/images/figma/home/mission-illustration.svg";
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
}: {
  childLabel: string;
  onBack: () => void;
}) {
  return (
    <header className="flex h-14 items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="flex size-11 items-center justify-center text-gray-800"
        aria-label="뒤로가기"
      >
        <ArrowLeft className="size-6" aria-hidden />
      </button>
      <div className="flex items-center gap-1 text-sm font-medium leading-normal text-gray-800">
        <span>{childLabel}</span>
        <ChevronDown className="size-4" aria-hidden />
      </div>
      <div className="size-11 opacity-0" aria-hidden />
    </header>
  );
}

export function MissionMetaRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
      <span className="text-sm font-medium leading-[1.4] text-gray-500">
        {label}
      </span>
      <span className="text-sm font-bold leading-[1.4] text-gray-800">
        {value}
      </span>
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
