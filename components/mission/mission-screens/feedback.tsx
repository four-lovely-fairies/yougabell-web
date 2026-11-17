"use client";

import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import {
  ApiError,
  clearMissionFeedbackDraft,
  getStoredSelectedChildId,
  loadCurrentMission,
  persistMissionFeedbackDraft,
  readMissionFeedbackDraft,
  submitMissionFeedback,
  type MissionLoadState,
} from "@/lib/api";
import { Mascot } from "@/components/characters/mascot";
import type { MissionFeedbackDraft } from "@/lib/mission-data";
import { EnergySlider, FeedbackChoiceGroup } from "./feedback-controls";
import { MissionContentSkeleton } from "./shared";

export function MissionFeedbackScreen({
  executionId,
  mode,
}: {
  executionId: string | null;
  mode: "api" | "demo" | null;
}) {
  const router = useRouter();
  const [missionState, setMissionState] = useState<MissionLoadState | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  // 지금까지 보여 준 질문 수 (1~4). 답하면 다음 질문이 맨 위에 나타난다.
  const [revealed, setRevealed] = useState(1);
  // 화면을 열 때 이미 보이던 질문(임시 저장 복원)은 연출 없이 바로 보여 준다.
  const [initialRevealed, setInitialRevealed] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<MissionFeedbackDraft>({
    childReaction: null,
    parentEnergy: null,
    missionSatisfaction: null,
    note: "",
  });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!executionId) {
        router.replace("/mission");
        return;
      }

      setLoading(true);
      const selectedChildId = getStoredSelectedChildId();
      const nextMissionState = await loadCurrentMission(selectedChildId);

      if (cancelled) {
        return;
      }

      setMissionState(nextMissionState);
      const restored = readMissionFeedbackDraft(executionId);
      setDraft(
        restored ?? {
          childReaction: null,
          parentEnergy: 0,
          missionSatisfaction: null,
          note: "",
        },
      );
      const restoredCount = restored ? revealedFromDraft(restored) : 1;
      setInitialRevealed(restoredCount);
      setRevealed(restoredCount);
      setLoading(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [executionId, router]);

  useEffect(() => {
    if (!executionId || loading) {
      return;
    }

    persistMissionFeedbackDraft(executionId, draft);
  }, [draft, executionId, loading]);

  // step번째 질문에 답하면 다음 질문을 연다 (이미 열렸으면 그대로).
  const revealAfter = (step: number) => {
    setRevealed((current) => {
      if (current > step) return current;
      const scroller = scrollRef.current;
      if (scroller && scroller.scrollTop > 0) {
        scroller.scrollTo({ top: 0, behavior: "smooth" });
      }
      return Math.min(4, step + 1);
    });
  };

  const submit = async () => {
    if (!executionId) {
      return;
    }

    if (draft.childReaction === null || draft.missionSatisfaction === null) {
      setError("모든 항목을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await submitMissionFeedback({
        executionId,
        draft,
        mode,
      });
      clearMissionFeedbackDraft(executionId);
      track({ type: "mission_feedback_submit" });
      router.push(
        `/mission/done?executionId=${executionId}&mode=${result.source}`,
      );
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? "놀이 피드백을 저장하지 못했어요. 다시 시도해주세요."
          : "API 서버에 연결할 수 없습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !missionState || !executionId) {
    return <MissionContentSkeleton />;
  }

  return (
    <>
      <div className="flex h-dvh flex-col bg-[#fbfbfb] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-safe text-gray-800">
        <header className="flex h-14 shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/mission/effect?executionId=${executionId}&mode=${mode ?? missionState.source}`,
              )
            }
            className="flex size-11 items-center justify-center text-gray-800"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="size-6" aria-hidden />
          </button>
          <h1 className="text-lg font-semibold leading-6">놀이 피드백</h1>
          <button
            type="button"
            onClick={() => setShowCloseConfirm(true)}
            className="flex size-11 items-center justify-center text-gray-800"
            aria-label="닫기"
          >
            <X className="size-6" aria-hidden />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto pb-8">
          {/* 질문은 하나씩 — 답할 때마다 다음 질문이 맨 위에 나타나고 이전 질문은 아래로 밀린다. */}
          <div className="mt-6 flex flex-col">
            {[
              <FeedbackChoiceGroup
                key="reaction"
                title={`오늘 진행한 놀이에서\n아이의 반응은 어땠나요?`}
                description="향후 놀이 생성과 주간 리포트 작성에 도움이 됩니다."
                value={draft.childReaction}
                onChange={(value) => {
                  setDraft((current) => ({ ...current, childReaction: value }));
                  revealAfter(1);
                }}
                labels={[
                  "나빠요",
                  "별로에요",
                  "보통이에요",
                  "좋아요!",
                  "최고에요!",
                ]}
              />,
              <div key="energy" className="space-y-6">
                <h2 className="whitespace-pre-line text-[18px] font-bold leading-[1.4] text-gray-800">
                  놀이를 마친 지금,{"\n"}엄마의 에너지 상태는 어떤가요?
                </h2>
                <EnergySlider
                  value={draft.parentEnergy}
                  onChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      parentEnergy: value,
                    }))
                  }
                  onCommit={() => revealAfter(2)}
                />
              </div>,
              <FeedbackChoiceGroup
                key="satisfaction"
                title="오늘 놀이는 얼마나 만족스러웠나요?"
                description="소중한 의견을 담아 더 만족스러운 다음 놀이를 준비할게요."
                value={draft.missionSatisfaction}
                onChange={(value) => {
                  setDraft((current) => ({
                    ...current,
                    missionSatisfaction: value,
                  }));
                  revealAfter(3);
                }}
                labels={[
                  "아쉬워요",
                  "부족해요",
                  "보통이에요",
                  "만족해요",
                  "완벽해요!",
                ]}
              />,
              <div key="note" className="-mb-2 space-y-4">
                <h2 className="whitespace-pre-line text-[18px] font-bold leading-[1.4] text-gray-800">
                  오늘 아이가 가장 많이 말한{"\n"}단어들을 적어주세요.
                </h2>
                <textarea
                  value={draft.note}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      note: event.target.value,
                    }))
                  }
                  placeholder={
                    '리액션에 대해 간략히 적어주세요. (선택)\n예) 공룡, "엄마 사랑해", 분홍색, 그림 그리기 등'
                  }
                  className="h-31.5 w-full resize-none rounded-xl border border-[#f2f2f2] bg-white px-5 py-5 text-sm leading-[1.6] text-gray-800 outline-none placeholder:text-[rgba(0,0,0,0.5)]"
                  maxLength={500}
                />
              </div>,
            ]
              .slice(0, revealed)
              .map((question, index) => (
                <RevealQuestion
                  key={question.key}
                  animate={index >= initialRevealed}
                >
                  {question}
                </RevealQuestion>
              ))
              .reverse()}
          </div>
        </div>

        <div className="shrink-0 pb-2 pt-3">
          {error ? (
            <p className="mb-3 text-center text-xs leading-4 text-[#ff5c5c]">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void submit()}
            disabled={submitting}
            className="flex h-13 w-full items-center justify-center rounded-2xl bg-primary-300 text-base font-medium leading-[1.4] text-white disabled:bg-[#cfc3ff]"
          >
            놀이 완료
          </button>
        </div>
      </div>
      {showCloseConfirm ? (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative mx-auto flex min-h-dvh w-full max-w-107.5 items-center justify-center px-5">
            <div className="w-full max-w-83.5 rounded-[20px] bg-white px-4 pb-5 pt-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <div className="flex flex-col items-center gap-3">
                <Mascot pose="clipboard" className="h-[75px] w-[83px]" />
                <div className="w-full pt-2 text-center">
                  <h2 className="text-lg font-bold leading-[1.4] text-gray-800">
                    잠시만요! 지금 아니면
                    <br />
                    피드백 작성이 어려워요.
                  </h2>
                </div>
                <p className="text-center text-sm font-medium leading-[1.4] text-[#7b7b7b]">
                  지금 작성하지 않으면 정확한 분석 리포트를
                  <br />
                  받아보실 수 없는데, 그래도 건너뛰시겠어요?
                </p>
              </div>
              <div className="mt-4 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary-300 px-4 py-3.5 text-sm font-medium leading-[1.4] text-white"
                >
                  피드백 작성하기
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="flex h-5 items-center justify-center text-xs font-medium leading-[1.4] text-[#9d9d9d]"
                >
                  건너뛰기
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

// 임시 저장된 답이 있으면 어디까지 답했는지로 보여 줄 질문 수를 정한다.
function revealedFromDraft(draft: MissionFeedbackDraft) {
  if (draft.missionSatisfaction !== null) return 4;
  if ((draft.parentEnergy ?? 0) > 0) return 3;
  if (draft.childReaction !== null) return 2;
  return 1;
}

// 새 질문 등장 — 두 단계로 자연스럽게.
// 1) 자리가 먼저 부드럽게 열리며 아래 질문들이 밀려 내려가고,
// 2) 살짝 늦게 질문이 위에서 내려오며 서서히 나타난다.
const OPEN_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const FADE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function RevealQuestion({
  animate,
  children,
}: {
  animate: boolean;
  children: ReactNode;
}) {
  // 동작 줄이기 설정이면 연출 없이 바로 보여 준다.
  const [shown, setShown] = useState(
    () =>
      !animate ||
      (typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches),
  );
  useEffect(() => {
    if (shown) return;
    // 닫힌 상태가 한 번 그려진 뒤 펼쳐야 전환이 끊기지 않는다.
    const timer = window.setTimeout(() => setShown(true), 30);
    return () => window.clearTimeout(timer);
  }, [shown]);

  return (
    <div
      className="grid"
      style={{
        gridTemplateRows: shown ? "1fr" : "0fr",
        transition: `grid-template-rows 620ms ${OPEN_EASE}`,
      }}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className="pb-8"
          style={{
            opacity: shown ? 1 : 0,
            transform: shown ? "translate3d(0, 0, 0)" : "translate3d(0, -10px, 0)",
            transition: `opacity 520ms ${FADE_EASE} 160ms, transform 640ms ${FADE_EASE} 120ms`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
