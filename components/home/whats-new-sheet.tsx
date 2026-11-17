"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";

// "새로워진 육아벨을 소개해요" — 업데이트 안내 바텀시트 (Figma 261117_업데이트 소식 바텀시트).
// 각 장의 미리보기는 실제 화면 이미지 위에 탭·결과 레이어를 얹어, 확대→탭→축소 순서로 반복 재생한다.

// 폰 화면 좌표계(390×844) → 미리보기 무대(342×261)
const PHONE_W = 390;
const PHONE_H = 844;
const STAGE_W = 342;
const STAGE_H = 261;
const BASE = 210 / PHONE_W; // 무대 안 기본 폰 너비 210px
const MOVE_MS = 450;

type Layer =
  | "dayLabel"
  | "recordCard"
  | "historyList"
  | "pressed"
  | "doneSheet"
  | "heart"
  | "toast"
  | "favoriteList";

type Step = {
  /** 무대 안 폰 위치(px)와 확대 배율 */
  x: number;
  y: number;
  zoom: number;
  /** 다음 단계까지 머무는 시간(ms) */
  hold: number;
  /** 탭 표시 위치 (폰 좌표) */
  tap?: [number, number];
  on?: Layer[];
};

type Demo = { base: string; steps: Step[] };

const DEMOS: Demo[] = [
  {
    base: "/images/whats-new/history-calendar.jpg",
    steps: [
      { x: 66, y: 24, zoom: 1, hold: 800 },
      { x: 66, y: -70, zoom: 1, hold: 1100, tap: [101, 403], on: ["dayLabel"] },
      { x: 66, y: -200, zoom: 1, hold: 1500, on: ["dayLabel", "recordCard"] },
      { x: -120, y: -13, zoom: 2.2, hold: 900, tap: [330, 121], on: ["dayLabel", "recordCard"] },
      { x: 66, y: 24, zoom: 1, hold: 2000, on: ["historyList"] },
    ],
  },
  {
    base: "/images/whats-new/mission-detail.jpg",
    steps: [
      { x: 66, y: -217, zoom: 1, hold: 800 },
      { x: -57, y: -602, zoom: 1.9, hold: 1100, tap: [253, 773], on: ["pressed"] },
      { x: 66, y: -217, zoom: 1, hold: 1900, on: ["doneSheet"] },
    ],
  },
  {
    base: "/images/whats-new/mission-detail.jpg",
    steps: [
      { x: 66, y: 24, zoom: 1, hold: 800 },
      { x: -78, y: 0, zoom: 2, hold: 1200, tap: [350, 74], on: ["heart", "toast"] },
      { x: 66, y: 24, zoom: 1, hold: 1900, on: ["heart", "favoriteList"] },
    ],
  },
];

const PAGES = [
  { headline: ["지금까지 한 놀이를", "한눈에 볼 수 있어요"] },
  { headline: ["타이머 없이도", "놀이를 마칠 수 있어요"] },
  { headline: ["마음에 드는 놀이는", "저장해 두고 다시 해요"] },
];

export function WhatsNewSheet({ onClose }: { onClose: () => void }) {
  const [page, setPage] = useState(0);
  const last = page === PAGES.length - 1;

  return (
    <BottomSheet
      title="새로워진 육아벨을 소개해요!"
      titleAccessory={
        <Image src="/images/whats-new/party-popper.svg" alt="" width={22} height={22} />
      }
      onClose={onClose}
      labelledById="whats-new-title"
    >
      <div className="flex flex-col items-center gap-4 px-6">
        <DemoStage key={page} demo={DEMOS[page]} />
        <div className="flex items-center gap-1.5" aria-hidden>
          {PAGES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === page ? "w-4.5 bg-gray-800" : "w-1.5 bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      <p
        className="px-6 py-8 text-center text-[20px] font-bold leading-[1.4] text-gray-800"
        aria-live="polite"
      >
        {PAGES[page].headline[0]}
        <br />
        {PAGES[page].headline[1]}
      </p>

      <div className="flex gap-2 px-5">
        {page > 0 ? (
          <button
            type="button"
            className="flex h-14 flex-1 items-center justify-center rounded-2xl bg-[#f2f2f4] text-base font-semibold text-gray-600 active:bg-gray-100"
            onClick={() => setPage((p) => p - 1)}
          >
            이전
          </button>
        ) : null}
        <Button
          className="flex-1"
          onClick={() => (last ? onClose() : setPage((p) => p + 1))}
        >
          {last ? "닫기" : "다음"}
        </Button>
      </div>
    </BottomSheet>
  );
}

// 무대 폭에 맞춰 342×261 좌표계를 비율 그대로 줄이거나 늘린다.
function useStageScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / STAGE_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, scale };
}

function DemoStage({ demo }: { demo: Demo }) {
  const { ref, scale } = useStageScale();
  const [index, setIndex] = useState(0);
  const step = demo.steps[index];

  useEffect(() => {
    const timer = window.setTimeout(
      () => setIndex((i) => (i + 1) % demo.steps.length),
      step.hold + MOVE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [demo.steps.length, step.hold]);

  const on = (layer: Layer) => step.on?.includes(layer) ?? false;
  const s = BASE * step.zoom;

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative w-full overflow-hidden rounded-[20px] bg-[#f5f5f7]"
      style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}` }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}
      >
        {/* 폰 화면 — 위치·배율이 단계마다 바뀌며 확대/축소/스크롤처럼 보인다 */}
        <div
          className="absolute left-0 top-0 origin-top-left overflow-hidden rounded-[44px] border-2 border-[#e9e9e9] bg-white transition-transform ease-in-out motion-reduce:transition-none"
          style={{
            width: PHONE_W,
            height: PHONE_H,
            transitionDuration: `${MOVE_MS}ms`,
            transform: `translate(${step.x}px, ${step.y}px) scale(${s})`,
          }}
        >
          <Image src={demo.base} alt="" fill sizes="460px" className="object-cover object-top" priority />

          {/* 지난 놀이 */}
          <Fade show={on("dayLabel")}>
            <div className="absolute left-4 top-[618px] h-[26px] w-[170px] bg-[#fafafb] pl-1 text-[15px] font-bold leading-[26px] text-gray-800">
              11.16 월요일
            </div>
          </Fade>
          <div
            className="absolute left-5 flex h-[84px] w-[350px] items-center gap-3.5 rounded-2xl bg-white px-4 transition-all ease-out motion-reduce:transition-none"
            style={{
              top: on("recordCard") ? 650 : 700,
              opacity: on("recordCard") ? 1 : 0,
              transitionDuration: `${MOVE_MS}ms`,
            }}
          >
            <CheckCircle size={40} />
            <div>
              <p className="text-base font-bold leading-[1.4] text-gray-800">짝짜꿍 노래 게임</p>
              <p className="text-[13px] leading-[1.4] text-gray-500">언어발달 · 8분 완료</p>
            </div>
          </div>
          <Fade show={on("historyList")}>
            <div className="absolute left-0 top-0 h-[1398px] w-[390px]">
              <Image src="/images/whats-new/history-list.jpg" alt="" fill sizes="460px" className="object-cover object-top" />
            </div>
          </Fade>

          {/* 타이머 생략 */}
          <Fade show={on("pressed")}>
            <div className="absolute left-[141px] top-[748px] h-[50px] w-[225px] rounded-[14px] bg-black/15" />
          </Fade>
          <Fade show={on("doneSheet")}>
            <div className="absolute inset-0 bg-black/40" />
          </Fade>
          <div
            className="absolute left-0 flex h-[300px] w-[390px] flex-col items-center rounded-t-[28px] bg-white pt-9 transition-[top] ease-out motion-reduce:transition-none"
            style={{ top: on("doneSheet") ? 544 : PHONE_H, transitionDuration: `${MOVE_MS}ms` }}
          >
            <CheckCircle size={56} />
            <p className="mt-4 text-[22px] font-bold leading-[1.4] text-gray-800">놀이를 마쳤어요</p>
            <p className="mt-1 text-[15px] leading-[1.4] text-gray-500">타이머 없이도 기록됐어요</p>
            <div className="mt-8 flex h-[54px] w-[350px] items-center justify-center rounded-2xl bg-primary-300 text-base font-bold text-white">
              피드백 남기기
            </div>
          </div>

          {/* 관심 놀이 */}
          <Fade show={on("heart")}>
            <svg className="absolute left-[336px] top-[60px]" width="28" height="28" viewBox="0 0 24 24">
              <path
                d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"
                fill="#FF6B9A"
              />
            </svg>
          </Fade>
          <div
            className="absolute left-[77px] flex h-11 w-[236px] items-center justify-center rounded-full bg-gray-800 text-[15px] font-medium text-white transition-all ease-out motion-reduce:transition-none"
            style={{
              top: on("toast") ? 120 : 100,
              opacity: on("toast") ? 1 : 0,
              transitionDuration: `${MOVE_MS}ms`,
            }}
          >
            관심 놀이에 저장했어요
          </div>
          <Fade show={on("favoriteList")}>
            <div className="absolute inset-0">
              <Image src="/images/whats-new/favorites.jpg" alt="" fill sizes="460px" className="object-cover object-top" />
            </div>
          </Fade>

          {/* 탭 표시 — 누르는 자리에 반투명 원 */}
          {step.tap ? (
            <span
              key={`${index}`}
              className="absolute size-12 animate-pop-in rounded-full border-[3px] border-white bg-black/20 motion-reduce:animate-none"
              style={{ left: step.tap[0] - 24, top: step.tap[1] - 24, animationDelay: `${MOVE_MS}ms` }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Fade({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <div
      className="transition-opacity ease-out motion-reduce:transition-none"
      style={{ opacity: show ? 1 : 0, transitionDuration: `${MOVE_MS}ms` }}
    >
      {children}
    </div>
  );
}

function CheckCircle({ size }: { size: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-primary-300"
      style={{ width: size, height: size }}
    >
      <svg width={size / 2} height={size / 2} viewBox="0 0 20 20" fill="none">
        <path d="M5 10.5l3.2 3.2L15 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
