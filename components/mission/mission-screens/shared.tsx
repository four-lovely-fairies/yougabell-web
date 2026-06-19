'use client';

import { ArrowLeft, ChevronDown, ChevronRight, X } from 'lucide-react';
import type { ReactNode } from 'react';

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
}: {
  childLabel: string;
  onBack: () => void;
  /** 전달 시 자녀 라벨이 자녀 변경 트리거 버튼이 된다. 미전달 시 정적 표시. */
  onSwitchChild?: () => void;
}) {
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

const MISSION_SOURCE_REFERENCES = [
  {
    category: 'CDC',
    source: '(미국 질병통제예방센터) — 발달 마일스톤 공식 기준',
  },
  {
    category: 'AAP',
    source: '(미국소아과학회) — 소아 언어 발달 가이드',
  },
  {
    category: 'ASHA',
    source: '(미국 언어청각협회) — 수용/표현 언어 발달 기준',
  },
  {
    category: 'WHO',
    source: '글로벌 아동 발달 마일스톤',
  },
  {
    category: '',
    source:
      'Tomasello, Bates, Bruner, Fenson 등 국제 발달심리·언어획득 분야 핵심 학술 문헌',
  },
];

/** 출처 자세히 보기 — Figma 미션 출처 중앙 모달. */
export function MissionSourceSheet({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.2)] px-7"
      role="dialog"
      aria-modal="true"
      aria-label="미션 출처"
      onClick={onClose}
    >
      <div className="mx-auto w-full max-w-83.5">
        <div
          className="overflow-hidden rounded-[20px] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="px-4 pb-2 pt-6">
            <div className="flex w-full items-center justify-center gap-2 pt-2">
              <h2 className="min-w-0 flex-1 text-lg font-bold leading-[1.4] text-black">
                자료 출처
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex size-6 shrink-0 items-center justify-center text-gray-800"
                aria-label="자료 출처 닫기"
              >
                <X className="size-6" aria-hidden />
              </button>
            </div>

            <div className="mt-3 w-full overflow-hidden">
              <div className="grid grid-cols-[92px_1fr] bg-[#f9fafb] text-sm font-bold leading-[1.4] text-[#0a0a0a]">
                <div className="px-3 py-[11px]">카테고리</div>
                <div className="px-3 py-[11px]">자료 출처</div>
              </div>
              {MISSION_SOURCE_REFERENCES.map((item, index) => (
                <div
                  key={`${item.category}-${index}`}
                  className="grid grid-cols-[92px_1fr] border-t border-[#e5e7eb] text-sm font-medium leading-[1.4] text-[#0a0a0a]"
                >
                  <div className="px-3 py-[11px]">{item.category}</div>
                  <div className="px-3 py-[11px]">{item.source}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 pb-5 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex h-12 w-full items-center justify-center rounded-md bg-primary-300 px-4 py-3.5 text-sm font-medium leading-[1.4] text-white"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TimerRing({ progress }: { progress: number }) {
  const outerSize = 273;
  const ringThickness = 26;
  const safeProgress = Math.max(0, Math.min(1, progress));
  const center = outerSize / 2;
  const radius = center - ringThickness / 2;
  const circumference = 2 * Math.PI * radius;
  const startAngle = 135;
  const endAngle = startAngle + safeProgress * 360;
  const knobRadians = endAngle * (Math.PI / 180);
  const knobX = center + Math.cos(knobRadians) * radius;
  const knobY = center + Math.sin(knobRadians) * radius;

  return (
    <div className="relative size-68.25">
      <svg
        viewBox={`0 0 ${outerSize} ${outerSize}`}
        className="absolute inset-0 size-full overflow-visible"
        aria-hidden
      >
        <defs>
          <filter
            id="mission-timer-ring-glow"
            x="-25%"
            y="-25%"
            width="150%"
            height="150%"
          >
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.584 0 0 0 0 0.447 0 0 0 0 1 0 0 0 0.28 0"
            />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f0f0f0"
          strokeWidth={ringThickness}
        />
        {safeProgress > 0 ? (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#9672ff"
            strokeWidth={ringThickness}
            strokeLinecap="round"
            strokeDasharray={`${circumference * safeProgress} ${circumference}`}
            strokeDashoffset={0}
            transform={`rotate(${startAngle} ${center} ${center})`}
            filter="url(#mission-timer-ring-glow)"
          />
        ) : null}
      </svg>
      <div className="absolute inset-6.5 rounded-full bg-[#fbfbfb] shadow-[inset_0_0_3px_rgba(0,0,0,0.04)]" />
      {safeProgress > 0 ? (
        <div
          className="absolute size-7.25 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#a88dff] bg-white"
          style={{ left: knobX, top: knobY }}
        />
      ) : null}
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
