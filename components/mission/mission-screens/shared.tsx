'use client';

import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useEdgeSwipeBack } from '@/hooks/use-edge-swipe-back';

// fixed 헤더 높이만큼 콘텐츠를 내리는 스페이서 (미션 화면용 re-export).
export { HeaderSpacer } from '@/components/app/app-header';

export const MISSION_META_ICONS = {
  time: '/icons/figma/mission/alarm.svg',
  category: '/icons/figma/mission/folder.svg',
  source: '/icons/figma/mission/source.svg',
  goal: '/icons/figma/mission/goal.svg',
} as const;
export const FEEDBACK_ICON_PATHS = [
  '/icons/figma/mission-feedback/very-bad.svg',
  '/icons/figma/mission-feedback/bad.svg',
  '/icons/figma/mission-feedback/neutral.svg',
  '/icons/figma/mission-feedback/good.svg',
  '/icons/figma/mission-feedback/very-good.svg',
] as const;

export function MissionHeader({
  childLabel,
  onBack,
  onSwitchChild,
  favorite,
}: {
  childLabel: string;
  onBack: () => void;
  /** 전달 시 오른쪽에 관심 놀이 하트를 보여 준다. */
  favorite?: { on: boolean; onToggle: () => void; busy?: boolean };
  /** 전달 시 자녀 라벨이 자녀 변경 트리거 버튼이 된다. 미전달 시 정적 표시. */
  onSwitchChild?: () => void;
}) {
  useEdgeSwipeBack(onBack);
  return (
    <header
      className="fixed inset-x-0 top-0 z-30 mx-auto w-full max-w-107.5 px-5 pt-safe"
      // Tailwind v4의 `to-[#fbfbfb]/0`은 color-mix(in oklab, … 0%, transparent)로
      // 컴파일돼 결국 transparent(투명 검정)로 붕괴 → iOS WebKit에서 흰색→투명
      // 페이드 중간이 회색 띠로 보인다. sRGB 보간 + 같은 색 알파 0의 inline
      // rgba 그라데이션으로 고정해 회색이 끼지 않게 한다.
      style={{
        background:
          'linear-gradient(to bottom, #fbfbfb 0%, #fbfbfb 55%, rgba(251,251,251,0) 100%)',
      }}
    >
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
        {favorite ? (
          <button
            type="button"
            onClick={favorite.onToggle}
            disabled={favorite.busy}
            aria-pressed={favorite.on}
            aria-label={favorite.on ? "관심 놀이에서 빼기" : "관심 놀이에 저장"}
            className="flex size-11 items-center justify-center transition-transform active:scale-90"
          >
            <Image
              src={favorite.on ? "/icons/figma/mission/heart-on.svg" : "/icons/figma/mission/heart-off.svg"}
              alt=""
              width={24}
              height={24}
            />
          </button>
        ) : (
          <div className="size-11 opacity-0" aria-hidden />
        )}
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
  if (Number.isNaN(birth.getTime())) return '';
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
                  selected ? 'bg-primary-50' : 'bg-white'
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

// Figma 05 출처 바텀시트 — 놀이 추천에 쓰는 공통 근거 자료.
const MISSION_SOURCE_REFERENCES = [
  { category: 'CDC', source: '미국 질병통제예방센터 · 발달 마일스톤 기준' },
  { category: 'AAP', source: '미국소아과학회 · 소아 언어 발달 가이드' },
  { category: 'ASHA', source: '미국 언어청각협회 · 수용/표현 언어 발달 기준' },
  { category: 'WHO', source: '세계보건기구 · 글로벌 아동 발달 마일스톤' },
  { category: '학술', source: 'Tomasello, Bates, Bruner 등 발달심리 문헌' },
];

/** 출처 자세히 보기 — Figma 미션 출처 중앙 모달. */
// Figma 05 출처 바텀시트 — 이 놀이의 출처(회색 박스) + 공통 근거 자료 목록 + 확인.
export function MissionSourceSheet({
  citation,
  onClose,
}: {
  /** 이 놀이의 출처 문구. 없으면 회색 박스를 숨긴다. */
  citation?: string | null;
  onClose: () => void;
}) {
  return (
    <BottomSheet title="자료 출처" onClose={onClose} labelledById="mission-source-title">
      <div className="flex flex-col gap-6 px-6">
        {citation ? (
          <p className="whitespace-pre-line rounded-xl bg-[#f5f5f7] p-4 text-sm leading-[1.4] text-gray-600">
            {citation}
          </p>
        ) : null}
        <dl className="flex flex-col gap-1 text-sm leading-[1.4]">
          {MISSION_SOURCE_REFERENCES.map((item, index) => (
            <div
              key={item.category}
              className={`flex items-start gap-3 py-3 ${
                index < MISSION_SOURCE_REFERENCES.length - 1 ? 'border-b border-[#efeff2]' : ''
              }`}
            >
              <dt className="w-12 shrink-0 font-bold text-gray-800">{item.category}</dt>
              <dd className="min-w-0 flex-1 text-gray-600">{item.source}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={onClose}
          className="flex h-13.5 w-full shrink-0 items-center justify-center rounded-2xl bg-primary-300 text-base font-medium leading-[1.4] text-white"
        >
          확인
        </button>
      </div>
    </BottomSheet>
  );
}

// 놀이 타이머 링 — Figma 6009:13164(Group 33922) 재현.
// - 배경 링: 보라→회색 5% 그라데이션 채움 + 바깥·안쪽 가장자리의 옅은 그라데이션 테두리
// - 진행 링: 오른쪽 위 진보라 → 왼쪽 아래 연보라 그라데이션, 흰색 안쪽 그림자로 광택
// - 손잡이: 흰색 → 연보라 세로 그라데이션 원(진행 링보다 조금 작아 링 색이 테두리처럼 보임)
export function TimerRing({ progress }: { progress: number }) {
  const size = 273;
  const thickness = 32.5;
  const knobRadius = 13.5;
  const safeProgress = Math.max(0, Math.min(1, progress));
  const center = size / 2;
  const radius = center - thickness / 2;
  const outerEdge = center - 0.5;
  const innerEdge = center - thickness + 0.5;
  // Figma에서 진행 링은 왼쪽 아래(약 112°)에서 시작해 시계 방향으로 자란다.
  const startAngle = 112;
  const endRadians = (startAngle + safeProgress * 360) * (Math.PI / 180);
  const knobX = center + Math.cos(endRadians) * radius;
  const knobY = center + Math.sin(endRadians) * radius;
  // 회전(transform)으로 시작점을 옮기면 그라데이션까지 같이 돌아가므로, 호를 경로로 직접 그린다.
  const startRadians = startAngle * (Math.PI / 180);
  const startX = center + Math.cos(startRadians) * radius;
  const startY = center + Math.sin(startRadians) * radius;
  const largeArc = safeProgress > 0.5 ? 1 : 0;
  const arcPath =
    safeProgress >= 0.999
      ? null
      : `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${knobX} ${knobY}`;

  return (
    <div className="relative size-68.25">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 size-full overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient
            id="mission-timer-track"
            x1="84.5"
            y1="263.5"
            x2="273"
            y2="147.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#9b78ff" stopOpacity="0.05" />
            <stop offset="1" stopColor="#666666" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient
            id="mission-timer-track-edge"
            x1="136.8"
            y1="0"
            x2="283.7"
            y2="266.4"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#000000" stopOpacity="0.12" />
            <stop offset="0.5" stopColor="#000000" stopOpacity="0" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient
            id="mission-timer-progress"
            x1="249.5"
            y1="60"
            x2="54.5"
            y2="343"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#9b78ff" />
            <stop offset="0.356" stopColor="#9672ff" />
            <stop offset="1" stopColor="#ede8fe" />
          </linearGradient>
          <linearGradient id="mission-timer-knob" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#ffffff" />
            <stop offset="1" stopColor="#e5deff" />
          </linearGradient>
          {/* 진행 링 안쪽 가장자리에 흰 빛이 번지는 광택 (Figma inner shadow, 흰색 80% blur 5.6) */}
          {/* 범위를 링 전체(선 굵기 포함) 기준으로 잡는다. 도형 기준(%)이면 선 굵기가 빠져 링 끝이 잘린다. */}
          <filter
            id="mission-timer-gloss"
            filterUnits="userSpaceOnUse"
            x={-thickness}
            y={-thickness}
            width={size + thickness * 2}
            height={size + thickness * 2}
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="alpha"
            />
            <feGaussianBlur stdDeviation="5.56" />
            <feComposite in2="alpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.8 0"
            />
            <feBlend mode="normal" in2="SourceGraphic" />
          </filter>
        </defs>

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#mission-timer-track)"
          strokeWidth={thickness}
        />
        <circle
          cx={center}
          cy={center}
          r={outerEdge}
          fill="none"
          stroke="url(#mission-timer-track-edge)"
          strokeWidth={1}
        />
        <circle
          cx={center}
          cy={center}
          r={innerEdge}
          fill="none"
          stroke="url(#mission-timer-track-edge)"
          strokeWidth={1}
        />

        {safeProgress > 0 ? (
          <>
            {arcPath ? (
              <path
                d={arcPath}
                fill="none"
                stroke="url(#mission-timer-progress)"
                strokeWidth={thickness}
                strokeLinecap="round"
                filter="url(#mission-timer-gloss)"
              />
            ) : (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="url(#mission-timer-progress)"
                strokeWidth={thickness}
                filter="url(#mission-timer-gloss)"
              />
            )}
            <circle
              cx={knobX}
              cy={knobY}
              r={knobRadius}
              fill="url(#mission-timer-knob)"
            />
          </>
        ) : null}
      </svg>
    </div>
  );
}

export function MissionIntroSkeleton() {
  return (
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-5 pt-safe" role="status" aria-label="불러오는 중">
      <Skeleton className="h-14 rounded-2xl" />
      <div className="mt-10 space-y-5">
        <Skeleton className="mx-auto h-23 w-27.5 rounded-[24px]" />
        <Skeleton className="mx-auto h-8 w-48 rounded-full" />
        <Skeleton className="h-32.5 rounded-[24px]" />
        <Skeleton className="h-42 rounded-[24px]" />
      </div>
    </div>
  );
}

export function MissionTimerSkeleton() {
  return (
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-5 pt-safe" role="status" aria-label="불러오는 중">
      <Skeleton className="h-14 rounded-2xl" />
      <div className="flex min-h-[calc(100dvh-103px)] items-center justify-center">
        <Skeleton className="size-68.25 rounded-full" />
      </div>
    </div>
  );
}

export function MissionContentSkeleton() {
  return (
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-5 pt-safe" role="status" aria-label="불러오는 중">
      <Skeleton className="h-14 rounded-2xl" />
      <div className="mt-10 space-y-5">
        <Skeleton className="mx-auto h-8 w-44 rounded-full" />
        <Skeleton className="mx-auto h-33 w-39.5 rounded-[28px]" />
        <Skeleton className="h-45 rounded-[28px]" />
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
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-5 pt-safe" role="status" aria-label="불러오는 중">
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
