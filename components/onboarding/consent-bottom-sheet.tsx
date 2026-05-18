"use client";

import { useState } from "react";
import { XIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ConsentDraft } from "@/lib/types";

type Props = {
  initial?: ConsentDraft;
  onClose: () => void;
  onConfirm: (next: ConsentDraft) => void;
};

const ITEMS: Array<{
  key: keyof ConsentDraft;
  label: string;
  required: boolean;
}> = [
  { key: "service", label: "서비스 이용약관 동의 (필수)", required: true },
  { key: "privacy", label: "개인정보 처리방침 (필수)", required: true },
  { key: "marketing", label: "마케팅 수신동의 (선택)", required: false },
];

export function ConsentBottomSheet({ initial, onClose, onConfirm }: Props) {
  const [state, setState] = useState<ConsentDraft>(
    initial ?? { service: false, privacy: false, marketing: false },
  );
  const allChecked = state.service && state.privacy && state.marketing;
  const requiredOk = state.service && state.privacy;

  const toggleAll = () => {
    const next = !allChecked;
    setState({ service: next, privacy: next, marketing: next });
  };
  const toggle = (key: keyof ConsentDraft) =>
    setState((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-black/20"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
    >
      <div
        className="w-full max-w-[390px] rounded-t-3xl bg-white pb-5 pt-7"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 pb-4">
          <h2
            id="consent-title"
            className="text-lg font-bold leading-[1.4] text-gray-800"
          >
            서비스를 이용을 위해 동의가 필요해요
          </h2>
          <button type="button" onClick={onClose} aria-label="닫기">
            <XIcon size={24} />
          </button>
        </header>

        <div className="flex flex-col gap-3 px-6 pb-4">
          <button
            type="button"
            onClick={toggleAll}
            className="flex w-full items-center gap-2 rounded-2xl bg-[#f8f9fb] p-4 text-left"
            aria-pressed={allChecked}
          >
            <CheckMark filled={allChecked} />
            <span className="text-sm font-medium text-gray-800">
              약관 전체동의
            </span>
            <span className="ml-1 text-xs text-gray-500">선택 동의 포함</span>
          </button>

          <div className="flex flex-col gap-1">
            {ITEMS.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-2xl p-4"
              >
                <button
                  type="button"
                  onClick={() => toggle(item.key)}
                  className="flex flex-1 items-center gap-2 text-left"
                  aria-pressed={state[item.key]}
                >
                  <CheckMark filled={false} active={state[item.key]} />
                  <span className="text-sm font-medium text-gray-800">
                    {item.label}
                  </span>
                </button>
                {/* TODO(content): 약관 본문 화면으로 이동. 1차에선 placeholder. */}
                <button
                  type="button"
                  aria-label={`${item.label} 자세히 보기`}
                  className="p-1"
                >
                  <ChevronRight />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pt-2">
          <Button
            type="button"
            size="full"
            disabled={!requiredOk}
            onClick={() => onConfirm(state)}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}

function CheckMark({
  filled,
  active = filled,
}: {
  filled: boolean;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex size-5 items-center justify-center rounded-sm",
        filled && active && "bg-gray-800 text-white",
        !filled && active && "text-[#9572ff]",
        !active && "text-gray-300",
      )}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.5 7L5.5 10L11.5 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function ChevronRight() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-gray-400"
    >
      <path
        d="M7.5 5L12.5 10L7.5 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
