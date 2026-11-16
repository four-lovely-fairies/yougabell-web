"use client";

import { useRouter } from "next/navigation";
import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  ChatVisual,
  MissionCardVisual,
  PhoneVisual,
} from "@/components/onboarding/guide-visuals";
import { Button } from "@/components/ui/button";
import { markOnboardingGuideSeen } from "@/lib/onboarding-guide";
import { cn } from "@/lib/utils";

type GuideSlide = {
  label: string;
  title: [string, string];
  description: [string, string];
  visual: ReactNode;
};

const SLIDES: GuideSlide[] = [
  {
    label: "오늘의 놀이",
    title: ["매일 우리 아이와", "뭐하고 놀까요?"],
    description: [
      "홈에서 매일 1개, 5분이면 끝나는",
      "우리 아이 발달 맞춤 놀이를 추천해줘요.",
    ],
    visual: <MissionCardVisual />,
  },
  {
    label: "발달 마일스톤",
    title: ["우리 아이, 지금 발달 단계에", "맞게 자라고 있을까요?"],
    description: [
      "발달 체크리스트를 하나씩 확인하고",
      "우리 아이에게 지금 부족한 부분을 파악해요.",
    ],
    visual: <PhoneVisual src="/images/figma/guide/milestone.png" />,
  },
  {
    label: "주간 리포트",
    title: ["이번 주 우리 아이는", "얼마나 자랐을까요?"],
    description: [
      "아이와 놀이하고 기록하면 매주 일요일,",
      "객관적인 성장 리포트를 받아볼 수 있어요",
    ],
    visual: <PhoneVisual src="/images/figma/guide/weekly-report.png" />,
  },
  {
    label: "AI 챗봇",
    title: ["우리 아이 궁금증,", "챗봇에게 물어봐요"],
    description: [
      "아이의 특성을 이해한 AI와",
      "맞춤형 대화를 나누고 조언을 받으세요",
    ],
    visual: <ChatVisual />,
  },
];

const SWIPE_THRESHOLD = 48;
const LEAVE_DURATION_MS = 320;

const enter = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

export default function OnboardingGuidePage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const pointerStartX = useRef<number | null>(null);

  const slide = SLIDES[index];
  const isFirst = index === 0;
  const isLast = index === SLIDES.length - 1;

  // 로그인 화면으로 갈 때 바로 끊기지 않게 가이드를 먼저 디졸브로 사라지게 한다.
  const finish = () => {
    if (leaving) return;
    markOnboardingGuideSeen();
    setLeaving(true);
    window.setTimeout(
      () => router.replace("/onboarding/intro"),
      LEAVE_DURATION_MS,
    );
  };

  const goTo = (next: number) => {
    if (next < 0 || next >= SLIDES.length || next === index) return;
    setIndex(next);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = event.clientX;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null) return;
    const deltaX = event.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (deltaX <= -SWIPE_THRESHOLD) goTo(index + 1);
    if (deltaX >= SWIPE_THRESHOLD) goTo(index - 1);
  };

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col transition-opacity duration-300 ease-out motion-reduce:transition-none",
        leaving && "pointer-events-none opacity-0",
      )}
    >
      {/* 배경 — 로그인 화면과 같은 옅은 보라 원 2개 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[163px] -top-[94px] h-[297px] w-[321px] rotate-[-5.78deg] rounded-full bg-primary-100/15 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[120px] top-[252px] h-[253px] w-[564px] rounded-full bg-primary-50 blur-[140px]"
      />

      <header className="relative z-10 flex h-14 shrink-0 items-center justify-end pt-[calc(max(47px,env(safe-area-inset-top))+8px)] box-content">
        <button
          type="button"
          onClick={finish}
          className="-mr-2 px-2 py-3 text-sm font-medium leading-[1.4] text-gray-400"
        >
          건너뛰기
        </button>
      </header>

      <div
        className="relative z-10 flex min-h-0 flex-1 touch-pan-y select-none flex-col"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          pointerStartX.current = null;
        }}
      >
        {/* key로 장마다 다시 마운트해 진입 애니메이션을 재생 */}
        <section
          key={index}
          aria-live="polite"
          className="flex h-[197px] min-h-0 shrink flex-col items-center justify-center gap-4 text-center"
        >
          <p
            className="animate-enter-up text-sm font-bold leading-[1.4] text-primary-300 motion-reduce:animate-none"
            style={enter(0)}
          >
            {slide.label}
          </p>
          <h1
            className="animate-enter-up text-[24px] font-bold leading-[1.3] text-gray-800 motion-reduce:animate-none"
            style={enter(80)}
          >
            {slide.title[0]}
            <br />
            {slide.title[1]}
          </h1>
          <p
            className="animate-enter-up text-sm font-medium leading-[1.4] text-gray-500 motion-reduce:animate-none"
            style={enter(160)}
          >
            {slide.description[0]}
            <br />
            {slide.description[1]}
          </p>
        </section>

        <div
          key={`visual-${index}`}
          className="mt-[19px] flex max-h-[322px] min-h-0 flex-1 items-center justify-center"
        >
          {slide.visual}
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 flex-col items-center pb-2">
        <div
          className="mb-[58px] mt-9 flex items-center gap-1"
          role="tablist"
          aria-label="서비스 소개"
        >
          {SLIDES.map((item, i) => (
            <button
              key={`${item.label}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${i + 1}번째 소개`}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 ease-out",
                i === index ? "w-[18px] bg-gray-800" : "w-1.5 bg-gray-200",
              )}
            />
          ))}
        </div>

        <div className="flex w-full gap-2">
          {!isFirst && !isLast ? (
            <Button
              size="full"
              className="h-[54px] flex-1 bg-gray-50 font-medium text-gray-900 hover:bg-gray-100 active:bg-gray-100"
              variant="ghost"
              onClick={() => goTo(index - 1)}
            >
              이전
            </Button>
          ) : null}
          <Button
            size="full"
            className="h-[54px] flex-1 font-medium"
            onClick={isLast ? finish : () => goTo(index + 1)}
          >
            {isLast ? "시작하기" : "다음"}
          </Button>
        </div>
      </div>
    </div>
  );
}
