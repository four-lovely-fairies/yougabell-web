"use client";

import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
      setDraft(
        readMissionFeedbackDraft(executionId) ?? {
          childReaction: null,
          parentEnergy: 0,
          missionSatisfaction: null,
          note: "",
        },
      );
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
      router.push(
        `/mission/done?executionId=${executionId}&mode=${result.source}`,
      );
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? "미션 피드백을 저장하지 못했어요. 다시 시도해주세요."
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
      <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-safe text-gray-800">
        <header className="flex h-14 items-center justify-between">
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
          <h1 className="text-lg font-semibold leading-6">미션피드백</h1>
          <button
            type="button"
            onClick={() => setShowCloseConfirm(true)}
            className="flex size-11 items-center justify-center text-gray-800"
            aria-label="닫기"
          >
            <X className="size-6" aria-hidden />
          </button>
        </header>

        <div className="pb-8">
          <div className="mt-6 space-y-10">
            <FeedbackChoiceGroup
              title={`오늘 진행한 미션에서\n아이의 반응은 어땠나요?`}
              description="향후 미션 생성과 주간 리포트 작성에 도움이 됩니다."
              value={draft.childReaction}
              onChange={(value) =>
                setDraft((current) => ({ ...current, childReaction: value }))
              }
              labels={[
                "나빠요",
                "별로에요",
                "보통이에요",
                "좋아요!",
                "최고에요!",
              ]}
            />

            <div className="space-y-4">
              <h2 className="whitespace-pre-line text-[18px] font-bold leading-[1.4] text-gray-800">
                미션을 마친 지금,{"\n"}엄마의 에너지 상태는 어떤가요?
              </h2>
              <EnergySlider
                value={draft.parentEnergy}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    parentEnergy: value,
                  }))
                }
              />
            </div>

            <FeedbackChoiceGroup
              title="오늘 미션은 만족스러웠나요?"
              description="소중한 의견을 담아 더 만족스러운 다음 미션을 준비할게요."
              value={draft.missionSatisfaction}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  missionSatisfaction: value,
                }))
              }
              labels={[
                "아쉬워요",
                "부족해요",
                "보통이에요",
                "만족해요",
                "완벽해요!",
              ]}
            />

            <div className="space-y-4">
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
            </div>
          </div>
        </div>

        <div className="pb-2 pt-3">
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
            미션 완료
          </button>
        </div>
      </div>
      {showCloseConfirm ? (
        <div
          className="fixed inset-0 z-50 bg-black/20"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative mx-auto flex min-h-dvh w-full max-w-107.5 items-center justify-center px-5">
            <div className="w-full max-w-83.5 rounded-xl bg-white px-5 pb-5 pt-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
              <h2 className="text-center text-lg font-bold leading-[1.4] text-gray-800">
                작성 중인 피드백이 있어요
              </h2>
              <p className="mt-2 text-center text-sm font-medium leading-5 text-gray-500">
                지금 나가면 작성한 내용이 사라져요.
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#f2f3f5] text-base font-medium text-gray-700"
                >
                  나가기
                </button>
                <button
                  type="button"
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex h-12 flex-1 items-center justify-center rounded-xl bg-primary-300 text-base font-medium text-white"
                >
                  계속 작성하기
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
