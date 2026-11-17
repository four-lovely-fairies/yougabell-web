"use client";

import { useRef } from "react";
import { FEEDBACK_ICON_PATHS } from "./shared";

export function FeedbackChoiceGroup({
  title,
  description,
  value,
  onChange,
  labels,
}: {
  title: string;
  description?: string;
  value: number | null;
  onChange: (value: number) => void;
  labels: [string, string, string, string, string];
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <h2 className="whitespace-pre-line text-[18px] font-bold leading-[1.4] text-gray-800">
          {title}
        </h2>
        {description ? (
          <p className="text-sm font-medium leading-[1.4] text-gray-500">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex items-start justify-between">
        {FEEDBACK_ICON_PATHS.map((src, index) => {
          const level = index + 1;
          const selected = value === level;

          return (
            <button
              key={src}
              type="button"
              onClick={() => onChange(level)}
              aria-pressed={selected}
              className="flex w-13 flex-col items-center gap-2 text-center"
            >
              <img
                src={src}
                alt=""
                className={`size-10 transition ${
                  selected
                    ? ""
                    : "grayscale brightness-[0.96] contrast-[0.92] opacity-55"
                }`}
                aria-hidden
              />
              <span className="text-xs font-normal leading-[1.4] text-gray-500">
                {labels[index]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function EnergySlider({
  value,
  onChange,
  onCommit,
}: {
  value: number | null;
  onChange: (value: number) => void;
  /** 손가락·마우스를 떼거나 키보드로 값을 정했을 때 */
  onCommit?: () => void;
}) {
  const sliderValue = value ?? 0;
  const stepCount = 11; // 0~10 (Figma)
  const normalizedProgress = sliderValue / (stepCount - 1);
  const thumbSizePx = 28;
  const thumbRadiusPx = thumbSizePx / 2;
  const trackHeightPx = 16;
  const tickSizePx = 5;
  const tickPositions = Array.from({ length: stepCount }, (_, index) => {
    const stepProgress = index / (stepCount - 1);
    return `calc(${thumbRadiusPx}px + (100% - ${thumbSizePx}px) * ${stepProgress})`;
  });
  const thumbLeft = `calc(${thumbRadiusPx}px + (100% - ${thumbSizePx}px) * ${normalizedProgress})`;
  const fillWidth = `calc(${thumbRadiusPx}px + (100% - ${thumbSizePx}px) * ${normalizedProgress})`;

  // 모바일 기본 range는 손잡이를 끌어야만 움직인다. 트랙 아무 곳이나 누르면 그 점수로 바로 가고,
  // 누른 채로 좌우로 움직이면 따라오게 직접 처리한다.
  const valueFromPointer = (clientX: number, track: HTMLElement) => {
    const rect = track.getBoundingClientRect();
    const usable = rect.width - thumbSizePx;
    if (usable <= 0) return sliderValue;
    const progress = (clientX - rect.left - thumbRadiusPx) / usable;
    return Math.round(Math.min(1, Math.max(0, progress)) * (stepCount - 1));
  };

  const draggingRef = useRef(false);
  const update = (clientX: number, track: HTMLElement) => {
    const next = valueFromPointer(clientX, track);
    if (next !== sliderValue) onChange(next);
  };

  return (
    <div className="space-y-2">
      <div
        className="relative h-7 cursor-pointer touch-pan-y select-none"
        onPointerDown={(event) => {
          draggingRef.current = true;
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            // 캡처를 못 해도 드래그 플래그로 따라간다
          }
          update(event.clientX, event.currentTarget);
        }}
        onPointerMove={(event) => {
          if (draggingRef.current) update(event.clientX, event.currentTarget);
        }}
        onPointerUp={(event) => {
          if (!draggingRef.current) return;
          draggingRef.current = false;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          onCommit?.();
        }}
        onPointerCancel={(event) => {
          draggingRef.current = false;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
      >
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-full bg-[#dddddd]"
          style={{ height: `${trackHeightPx}px` }}
        />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-primary-300"
          style={{ height: `${trackHeightPx}px`, width: fillWidth }}
        />
        {tickPositions.map((left, index) => (
          <span
            key={index}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
            style={{
              left,
              width: `${tickSizePx}px`,
              height: `${tickSizePx}px`,
            }}
            aria-hidden
          />
        ))}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary-300 bg-white shadow-[0_1px_6px_rgba(149,114,255,0.22)]"
          style={{
            left: thumbLeft,
            width: `${thumbSizePx}px`,
            height: `${thumbSizePx}px`,
          }}
        />
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={sliderValue}
          onChange={(event) => onChange(Number(event.target.value))}
          onKeyUp={onCommit}
          // 터치·마우스는 위 트랙이 처리하고, 이 input은 키보드·스크린리더용으로만 남긴다.
          className="pointer-events-none absolute inset-0 h-7 w-full opacity-0"
          aria-label="부모 에너지 점수"
        />
      </div>
      <div className="flex justify-between text-xs font-normal leading-[1.4] text-gray-500">
        <span>0점</span>
        <span>10점</span>
      </div>
    </div>
  );
}
