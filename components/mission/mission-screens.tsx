"use client";

import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Pause,
  Play,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  applyMissionExecutionAction,
  clearMissionFeedbackDraft,
  getStoredSelectedChildId,
  loadCurrentMission,
  loadMissionExecutionEffect,
  loadMissionExecution,
  persistMissionFeedbackDraft,
  readMissionFeedbackDraft,
  startMissionExecution,
  submitMissionFeedback,
  type MissionLoadState,
  type MissionEffectLoadState,
} from "@/lib/api";
import type {
  MissionExecutionSnapshot,
  MissionFeedbackDraft,
} from "@/lib/mission-data";

const MISSION_IMAGE_PATH = "/images/figma/home/mission-illustration.svg";
const FEEDBACK_ICON_PATHS = [
  "/icons/figma/mission-feedback/very-bad.svg",
  "/icons/figma/mission-feedback/bad.svg",
  "/icons/figma/mission-feedback/neutral.svg",
  "/icons/figma/mission-feedback/good.svg",
  "/icons/figma/mission-feedback/very-good.svg",
] as const;

export function MissionIntroScreen() {
  const router = useRouter();
  const [state, setState] = useState<MissionLoadState | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      const next = await loadCurrentMission(getStoredSelectedChildId());

      if (cancelled) {
        return;
      }

      setState(next);
      setLoading(false);

      if (next.data.activeExecution?.status === "in_progress") {
        router.replace(
          `/mission/timer?executionId=${next.data.activeExecution.id}&mode=${next.source}`,
        );
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    router.push("/");
  };

  const onStart = async () => {
    if (!state?.data) {
      return;
    }

    if (state.data.mission.status === "completed") {
      return;
    }

    if (state.data.activeExecution?.status === "paused") {
      router.push(
        `/mission/timer?executionId=${state.data.activeExecution.id}&mode=${state.source}`,
      );
      return;
    }

    setStarting(true);
    try {
      const result = await startMissionExecution({
        childId: state.data.selectedChild.id,
        missionId: state.data.mission.id,
        durationMinutes: state.data.mission.durationMinutes,
      });
      router.push(
        `/mission/timer?executionId=${result.execution.id}&mode=${result.source}`,
      );
    } finally {
      setStarting(false);
    }
  };

  if (loading || !state) {
    return <MissionIntroSkeleton />;
  }

  const { selectedChild, mission, activeExecution } = state.data;
  const isCompleted = mission.status === "completed";
  const ctaLabel = isCompleted
    ? "미션 완료"
    : activeExecution?.status === "paused"
      ? "이어서 하기"
      : "미션 시작하기";

  return (
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-11.75 text-gray-800">
      <MissionHeader
        childLabel={`${selectedChild.name} (${selectedChild.ageLabel})`}
        onBack={goBack}
      />

      <div className="flex min-h-[calc(100dvh-103px-96px)] flex-col items-center justify-center gap-6">
        <img
          src={MISSION_IMAGE_PATH}
          alt=""
          className="h-23 w-27.5"
          aria-hidden
        />
        <div className="flex w-full flex-col items-center gap-5 text-center">
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-xs font-medium leading-[1.4] text-primary-300">
              {mission.subThemeLabel ?? "아이와 10분 가까워지기"}
            </p>
            <h1 className="text-2xl font-semibold leading-8 text-gray-800">
              {mission.title}
            </h1>
          </div>
          <p className="max-w-80 whitespace-pre-line text-sm leading-[1.4] text-gray-600">
            {mission.description}
          </p>
        </div>

        <div className="w-full rounded-[24px] border border-[#f4f4f4] bg-white px-6 py-5">
          <MissionMetaRow label="시간" value={mission.durationLabel} />
          <MissionMetaRow label="카테고리" value={mission.categoryLabel} />
          <MissionMetaRow label="출처" value={mission.sourceLabel} />
        </div>
      </div>

      <div className="pb-2 pt-5">
        {state.message ? (
          <p className="mb-3 text-center text-xs leading-4 text-gray-400">
            {state.message}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onStart}
          disabled={starting || isCompleted}
          className="flex h-13 w-full items-center justify-center rounded-2xl bg-primary-300 text-base font-medium leading-[1.4] text-white disabled:bg-gray-100 disabled:text-gray-600"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

export function MissionTimerScreen({
  executionId,
  mode,
}: {
  executionId: string | null;
  mode: "api" | "demo" | null;
}) {
  const router = useRouter();

  const [snapshot, setSnapshot] = useState<MissionExecutionSnapshot | null>(
    null,
  );
  const [missionState, setMissionState] = useState<MissionLoadState | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(10 * 60);
  const completeTriggeredRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      const selectedChildId = getStoredSelectedChildId();
      const [executionResult, missionResult] = await Promise.all([
        loadMissionExecution({
          childId: selectedChildId,
          executionId,
          mode,
        }),
        loadCurrentMission(selectedChildId),
      ]);

      if (cancelled) {
        return;
      }

      setActionError(null);
      setSnapshot(executionResult.execution);
      setMissionState(missionResult);
      setLoading(false);
      setRemainingSeconds(
        executionResult.execution
          ? computeRemainingSeconds(executionResult.execution, Date.now())
          : missionResult.data.mission.durationMinutes * 60,
      );

      if (!executionResult.execution) {
        router.replace("/mission");
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [executionId, mode, router]);

  useEffect(() => {
    if (snapshot?.status !== "in_progress") {
      return;
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [snapshot?.status]);

  const totalSeconds = (snapshot?.durationMinutes ?? 10) * 60;
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const childLabel = missionState
    ? `${missionState.data.selectedChild.name} (${missionState.data.selectedChild.ageLabel})`
    : "아이";

  const goBack = () => {
    router.push("/mission");
  };

  const onAction = useCallback(
    async (action: "pause" | "resume" | "complete" | "early_complete") => {
      if (!snapshot || actionLoading) {
        return;
      }

      const startedAt = Date.now();
      const previousSnapshot = snapshot;
      const previousRemainingSeconds = remainingSeconds;
      const optimisticState = createOptimisticState(
        snapshot,
        action,
        remainingSeconds,
        startedAt,
      );

      if (optimisticState) {
        setSnapshot(optimisticState.snapshot);
        setRemainingSeconds(optimisticState.remainingSeconds);
      }

      setActionError(null);
      setActionLoading(true);
      try {
        const result = await applyMissionExecutionAction({
          executionId: snapshot.id,
          action,
          mode,
        });

        if (result.execution) {
          setSnapshot(result.execution);
          if (action !== "pause" && action !== "resume") {
            setRemainingSeconds(
              computeRemainingSeconds(result.execution, Date.now()),
            );
          }
          completeTriggeredRef.current = false;
          return;
        }

        router.replace(
          `/mission/effect?executionId=${snapshot.id}&mode=${result.source}`,
        );
      } catch (error) {
        const selectedChildId = getStoredSelectedChildId();
        const resynced = await loadMissionExecution({
          childId: selectedChildId,
          executionId: snapshot.id,
          mode,
        }).catch(() => null);

        if (resynced?.execution) {
          setSnapshot(resynced.execution);
          setRemainingSeconds(
            computeRemainingSeconds(resynced.execution, Date.now()),
          );
        } else {
          setSnapshot(previousSnapshot);
          setRemainingSeconds(previousRemainingSeconds);
        }

        setActionError(
          action === "pause"
            ? "잠시 멈추는 데 실패했어요. 다시 시도해주세요."
            : action === "resume"
              ? "다시 시작하는 데 실패했어요. 다시 시도해주세요."
              : "미션 상태를 업데이트하지 못했어요.",
        );

        if (error instanceof ApiError) {
          return;
        }
        throw error;
      } finally {
        setActionLoading(false);
      }
    },
    [actionLoading, mode, remainingSeconds, router, snapshot],
  );

  useEffect(() => {
    if (
      !snapshot ||
      snapshot.status !== "in_progress" ||
      remainingSeconds > 0 ||
      completeTriggeredRef.current
    ) {
      return;
    }

    completeTriggeredRef.current = true;
    void onAction("complete");
  }, [onAction, remainingSeconds, snapshot]);

  if (loading || !snapshot) {
    return <MissionTimerSkeleton />;
  }

  return (
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-11.75 text-gray-800">
      <MissionHeader childLabel={childLabel} onBack={goBack} />
      <div className="flex min-h-[calc(100dvh-103px)] flex-col items-center justify-center gap-17">
        <div className="relative grid place-items-center">
          <TimerRing progress={progress} />
          <p className="text-[52px] font-bold leading-[1.4] text-gray-800">
            {formatTimer(remainingSeconds)}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3.75">
          {actionError ? (
            <p className="text-center text-sm font-medium leading-[1.4] text-[#ff5c5c]">
              {actionError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() =>
              void onAction(snapshot.status === "paused" ? "resume" : "pause")
            }
            disabled={actionLoading}
            className="inline-flex h-12.5 items-center gap-2 rounded-full bg-black px-5 py-3.75 text-base font-medium leading-none text-white disabled:opacity-60"
          >
            {snapshot.status === "paused" ? (
              <Play className="size-5" aria-hidden />
            ) : (
              <Pause className="size-5" aria-hidden />
            )}
            <span>
              {snapshot.status === "paused" ? "다시 시작하기" : "멈추기"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => void onAction("early_complete")}
            disabled={actionLoading}
            className="text-base font-medium leading-[1.4] text-[#7d8180] disabled:opacity-60"
          >
            조기완료
          </button>
        </div>
      </div>
    </div>
  );
}

export function MissionEffectScreen({
  executionId,
  mode,
}: {
  executionId: string | null;
  mode: "api" | "demo" | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<MissionEffectLoadState | null>(null);
  const [missionState, setMissionState] = useState<MissionLoadState | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!executionId) {
        router.replace("/mission");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [effectResult, missionResult] = await Promise.all([
          loadMissionExecutionEffect({ executionId, mode }),
          loadCurrentMission(getStoredSelectedChildId()),
        ]);

        if (cancelled) {
          return;
        }

        setState(effectResult);
        setMissionState(missionResult);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(
          loadError instanceof ApiError
            ? "미션 효과 정보를 불러오지 못했어요."
            : "API 서버에 연결할 수 없습니다.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [executionId, mode, router]);

  if (loading) {
    return <MissionContentSkeleton />;
  }

  if (!state || !executionId || error) {
    return (
      <MissionErrorState
        message={error ?? "미션 효과 정보를 불러오지 못했어요."}
        onBack={() => router.push("/")}
      />
    );
  }

  const childLabel = missionState
    ? `${missionState.data.selectedChild.name} (${missionState.data.selectedChild.ageLabel})`
    : "아이";

  return (
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-11.75 text-gray-800">
      <MissionHeader childLabel={childLabel} onBack={() => router.push("/")} />

      <div className="flex min-h-[calc(100dvh-103px-96px)] flex-col items-center justify-center gap-7">
        <img
          src={MISSION_IMAGE_PATH}
          alt=""
          className="h-33 w-39.5"
          aria-hidden
        />
        <div className="space-y-4 text-center">
          <h1 className="whitespace-pre-line text-[28px] font-bold leading-[1.35] text-gray-800">
            아이와{" "}
            <span className="text-primary-300">
              &quot;
              {state.data.mission.subThemeLabel ?? state.data.mission.title}
              &quot;
            </span>
            {"\n"}이 상승하셨어요!
          </h1>
        </div>
        <div className="w-full rounded-[28px] bg-[#f7f1ff] px-6 py-6">
          <p className="text-sm font-semibold leading-[1.4] text-primary-300">
            미션 효과
          </p>
          <p className="mt-3 whitespace-pre-line text-sm leading-[1.7] text-gray-700">
            {state.data.mission.effect}
          </p>
          {state.data.mission.goal ? (
            <p className="mt-4 text-xs leading-[1.6] text-gray-500">
              목표: {state.data.mission.goal}
            </p>
          ) : null}
        </div>
      </div>

      <div className="pb-2 pt-5">
        {state.message ? (
          <p className="mb-3 text-center text-xs leading-4 text-gray-400">
            {state.message}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() =>
            router.push(
              `/mission/feedback?executionId=${executionId}&mode=${state.source}`,
            )
          }
          className="flex h-13 w-full items-center justify-center rounded-2xl bg-primary-300 text-base font-medium leading-[1.4] text-white"
        >
          다음
        </button>
      </div>
    </div>
  );
}

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
      <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-11.75 text-gray-800">
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

export function MissionDoneScreen({
  executionId,
  mode,
}: {
  executionId: string | null;
  mode: "api" | "demo" | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<MissionEffectLoadState | null>(null);
  const [missionState, setMissionState] = useState<MissionLoadState | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!executionId) {
        router.replace("/");
        return;
      }

      const selectedChildId = getStoredSelectedChildId();
      const [effectResult, nextMissionState] = await Promise.all([
        loadMissionExecutionEffect({ executionId, mode }),
        loadCurrentMission(selectedChildId),
      ]);

      if (cancelled) {
        return;
      }

      setState(effectResult);
      setMissionState(nextMissionState);
      setLoading(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [executionId, mode, router]);

  if (loading || !state) {
    return <MissionContentSkeleton />;
  }

  const childLabel = missionState
    ? `${missionState.data.selectedChild.name} (${missionState.data.selectedChild.ageLabel})`
    : "아이";

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#fbfbfb] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-12 text-gray-800">
      <div
        className="pointer-events-none absolute left-1/2 top-48 h-63.25 w-141 -translate-x-1/2 rounded-full opacity-70 blur-[64px]"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(149,114,255,0.12) 0%, rgba(149,114,255,0.04) 55%, rgba(149,114,255,0) 100%)",
        }}
        aria-hidden
      />

      <header className="relative z-10 flex h-14 items-center justify-between">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/mission/feedback?executionId=${executionId ?? ""}&mode=${state.source}`,
            )
          }
          className="flex size-11 items-center justify-center text-gray-800"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="size-6" aria-hidden />
        </button>
        <div className="flex items-center gap-1 text-sm font-medium leading-normal text-gray-800">
          <span>{childLabel}</span>
          <ChevronDown className="size-4" aria-hidden />
        </div>
        <button
          type="button"
          onClick={() => router.push("/weekly-report")}
          className="flex size-11 items-center justify-center text-gray-800"
          aria-label="주간 리포트로 이동"
        >
          <CalendarDays className="size-6" aria-hidden />
        </button>
      </header>

      <div className="relative z-10 flex min-h-[calc(100dvh-104px-115px)] items-center justify-center">
        <div className="flex w-68.75 flex-col items-center gap-6 text-center">
          <img
            src={MISSION_IMAGE_PATH}
            alt=""
            className="h-23 w-27.5"
            aria-hidden
          />
          <div className="space-y-3.75">
            <h1 className="text-[20px] font-bold leading-[1.4] tracking-[-0.4px] text-gray-800">
              피드백 작성이
              <br />
              완료되었습니다.
            </h1>
            <p className="text-sm leading-[1.4] text-gray-600">
              남겨주신 피드백은
              <br />
              주간 리포트에 반영될 예정입니다.
              <br />
              오늘도 수고 많으셨습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 pb-2 pt-5">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex h-13 w-full items-center justify-center rounded-2xl bg-primary-300 text-base font-medium leading-[1.4] text-white"
        >
          홈으로 가기
        </button>
      </div>
    </div>
  );
}

function MissionHeader({
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

function MissionMetaRow({ label, value }: { label: string; value: string }) {
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

function TimerRing({ progress }: { progress: number }) {
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

function MissionIntroSkeleton() {
  return (
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-5 pt-11.75">
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

function MissionTimerSkeleton() {
  return (
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-5 pt-11.75">
      <div className="h-14 animate-pulse rounded-2xl bg-[#f2f2f2]" />
      <div className="flex min-h-[calc(100dvh-103px)] items-center justify-center">
        <div className="size-68.25 animate-pulse rounded-full bg-[#f2f2f2]" />
      </div>
    </div>
  );
}

function MissionContentSkeleton() {
  return (
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-5 pt-11.75">
      <div className="h-14 animate-pulse rounded-2xl bg-[#f2f2f2]" />
      <div className="mt-10 space-y-5">
        <div className="mx-auto h-8 w-44 animate-pulse rounded-full bg-[#f2f2f2]" />
        <div className="mx-auto h-33 w-39.5 animate-pulse rounded-[28px] bg-[#f2f2f2]" />
        <div className="h-45 animate-pulse rounded-[28px] bg-[#f2f2f2]" />
      </div>
    </div>
  );
}

function MissionErrorState({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-5 pt-11.75">
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

function FeedbackChoiceGroup({
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
    <div className="space-y-4">
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

function EnergySlider({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number) => void;
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

  return (
    <div className="space-y-2">
      <div className="relative h-7">
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
          className="absolute inset-0 h-7 w-full cursor-pointer opacity-0"
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

function computeRemainingSeconds(
  snapshot: MissionExecutionSnapshot,
  nowMs: number,
) {
  const totalSeconds = snapshot.durationMinutes * 60;
  if (snapshot.status !== "in_progress" || !snapshot.activeSegmentStartedAt) {
    return Math.max(0, snapshot.remainingSeconds);
  }

  const segmentElapsedSeconds = Math.max(
    0,
    Math.floor(
      (nowMs - new Date(snapshot.activeSegmentStartedAt).getTime()) / 1000,
    ),
  );

  return Math.max(
    0,
    totalSeconds - (snapshot.elapsedSeconds + segmentElapsedSeconds),
  );
}

function createOptimisticState(
  snapshot: MissionExecutionSnapshot,
  action: "pause" | "resume" | "complete" | "early_complete",
  remainingSeconds: number,
  nowMs: number,
) {
  const nowIso = new Date(nowMs).toISOString();

  if (action === "pause" && snapshot.status === "in_progress") {
    const totalSeconds = snapshot.durationMinutes * 60;

    return {
      snapshot: {
        ...snapshot,
        status: "paused" as const,
        activeSegmentStartedAt: null,
        pausedAt: nowIso,
        elapsedSeconds: Math.max(0, totalSeconds - remainingSeconds),
        remainingSeconds,
        serverNow: nowIso,
      },
      remainingSeconds,
    };
  }

  if (action === "resume" && snapshot.status === "paused") {
    return {
      snapshot: {
        ...snapshot,
        status: "in_progress" as const,
        activeSegmentStartedAt: nowIso,
        pausedAt: null,
        serverNow: nowIso,
      },
      remainingSeconds,
    };
  }

  return null;
}

function formatTimer(seconds: number) {
  const clamped = Math.max(0, seconds);
  const minutes = Math.floor(clamped / 60);
  const remainder = clamped % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainder
    .toString()
    .padStart(2, "0")}`;
}
