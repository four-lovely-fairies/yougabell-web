"use client";

import { ArrowLeft, ChevronDown, Pause, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  applyMissionExecutionAction,
  getStoredSelectedChildId,
  loadCurrentMission,
  loadMissionExecution,
  startMissionExecution,
  type MissionLoadState,
} from "@/lib/api";
import type { MissionExecutionSnapshot } from "@/lib/mission-data";

const MISSION_IMAGE_PATH = "/images/figma/home/mission-illustration.svg";

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

  return (
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-[47px] text-[#262626]">
      <MissionHeader
        childLabel={`${selectedChild.name} (${selectedChild.ageLabel})`}
        onBack={goBack}
      />

      <div className="flex min-h-[calc(100dvh-103px-96px)] flex-col items-center justify-center gap-6">
        <img
          src={MISSION_IMAGE_PATH}
          alt=""
          className="h-[92px] w-[110px]"
          aria-hidden
        />
        <div className="flex w-full flex-col items-center gap-5 text-center">
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-xs font-medium leading-[1.4] text-[#9572ff]">
              {mission.subThemeLabel ?? "아이와 10분 가까워지기"}
            </p>
            <h1 className="text-2xl font-semibold leading-8 text-[#262626]">
              {mission.title}
            </h1>
          </div>
          <p className="max-w-[320px] whitespace-pre-line text-sm leading-[1.4] text-[#555]">
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
          <p className="mb-3 text-center text-xs leading-4 text-[#9d9d9d]">
            {state.message}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onStart}
          disabled={starting}
          className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-[#9572ff] text-base font-medium leading-[1.4] text-white disabled:bg-[#cfc3ff]"
        >
          {activeExecution?.status === "paused"
            ? "이어서 하기"
            : "미션 시작하기"}
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

        router.replace("/");
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
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-[47px] text-[#262626]">
      <MissionHeader childLabel={childLabel} onBack={goBack} />
      <div className="flex min-h-[calc(100dvh-103px)] flex-col items-center justify-center gap-[68px]">
        <div className="relative grid place-items-center">
          <TimerRing progress={progress} />
          <p className="text-[52px] font-bold leading-[1.4] text-[#262626]">
            {formatTimer(remainingSeconds)}
          </p>
        </div>

        <div className="flex flex-col items-center gap-[15px]">
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
            className="inline-flex h-[50px] items-center gap-2 rounded-full bg-black px-5 py-[15px] text-base font-medium leading-none text-white disabled:opacity-60"
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
        className="flex size-11 items-center justify-center text-[#262626]"
        aria-label="뒤로가기"
      >
        <ArrowLeft className="size-6" aria-hidden />
      </button>
      <div className="flex items-center gap-1 text-sm font-medium leading-[1.5] text-[#262626]">
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
      <span className="text-sm font-medium leading-[1.4] text-[#7b7b7b]">
        {label}
      </span>
      <span className="text-sm font-bold leading-[1.4] text-[#262626]">
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
    <div className="relative size-[273px]">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from -90deg, #9572ff 0deg, #9572ff ${angle}deg, #efefef ${angle}deg, #efefef 360deg)`,
          filter: "drop-shadow(0 0 12px rgba(149,114,255,0.2))",
        }}
      />
      <div className="absolute inset-[26px] rounded-full bg-[#fbfbfb] shadow-[inset_0_0_3px_rgba(0,0,0,0.04)]" />
      <div
        className="absolute size-[29px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#a88dff] bg-white"
        style={{ left: knobX, top: knobY }}
      />
    </div>
  );
}

function MissionIntroSkeleton() {
  return (
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-5 pt-[47px]">
      <div className="h-14 animate-pulse rounded-2xl bg-[#f2f2f2]" />
      <div className="mt-10 space-y-5">
        <div className="mx-auto h-[92px] w-[110px] animate-pulse rounded-[24px] bg-[#f2f2f2]" />
        <div className="mx-auto h-8 w-48 animate-pulse rounded-full bg-[#f2f2f2]" />
        <div className="h-[130px] animate-pulse rounded-[24px] bg-[#f2f2f2]" />
        <div className="h-[168px] animate-pulse rounded-[24px] bg-[#f2f2f2]" />
      </div>
    </div>
  );
}

function MissionTimerSkeleton() {
  return (
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-5 pt-[47px]">
      <div className="h-14 animate-pulse rounded-2xl bg-[#f2f2f2]" />
      <div className="flex min-h-[calc(100dvh-103px)] items-center justify-center">
        <div className="size-[273px] animate-pulse rounded-full bg-[#f2f2f2]" />
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
