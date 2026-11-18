"use client";

import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  applyMissionExecutionAction,
  getStoredSelectedChildId,
  loadCurrentMission,
  loadMissionExecution,
  type MissionLoadState,
} from "@/lib/api";
import { goBackFromMissionTimer } from "@/lib/mission-navigation";
import { track } from "@/lib/analytics";
import type { MissionExecutionSnapshot } from "@/lib/mission-data";
import {
  HeaderSpacer,
  MissionHeader,
  MissionTimerSkeleton,
  TimerRing,
} from "./shared";

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
  const mission = missionState?.data.mission;

  const goBack = () => {
    goBackFromMissionTimer({ router, history: window.history });
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
          if (action === "pause") {
            track({ type: "mission_pause" });
          }
          if (action === "resume") {
            track({ type: "mission_resume" });
          }
          if (action !== "pause" && action !== "resume") {
            setRemainingSeconds(
              computeRemainingSeconds(result.execution, Date.now()),
            );
          }
          completeTriggeredRef.current = false;
          return;
        }

        track({
          type: "mission_complete",
          completionType: action === "early_complete" ? "early" : "timer",
          source: "timer_screen",
        });
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
              : "놀이 상태를 업데이트하지 못했어요.",
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
    <div className="flex h-dvh flex-col bg-[#fbfbfb] px-5 pb-[max(20px,env(safe-area-inset-bottom))] text-gray-800">
      <MissionHeader childLabel={childLabel} onBack={goBack} />
      <HeaderSpacer />
      {/* 타이머는 화면 세로 가운데, 설명 카드는 위쪽, 버튼은 타이머 아래 화면 높이 비율 간격.
          위·아래 행을 1fr로 같게 두어 타이머를 가운데에 놓고, 헤더 높이만큼 아래 여백(pb-12)을 더해
          헤더를 뺀 영역이 아니라 화면 전체 기준으로 가운데에 오게 한다 (Figma 6009:13146). */}
      <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto_1fr] justify-items-center overflow-y-auto pb-12 pt-3">
        {mission ? (
          <section className="mb-4 self-start w-full rounded-[24px] bg-[#fbfbfb] px-6 py-5 shadow-[0_4px_23px_rgba(0,0,0,0.05)]">
            <h1 className="text-lg font-bold leading-[1.4] text-gray-800">
              {mission.title}
            </h1>
            <p className="mt-4 text-sm font-normal leading-[1.4] text-gray-600">
              {mission.description}
            </p>
          </section>
        ) : (
          <div />
        )}

        <div className="relative grid place-items-center">
          <TimerRing progress={progress} />
          <div className="absolute inset-0 grid place-items-center">
            <p className="font-suit text-[52px] font-bold leading-[1.4] text-gray-800">
              {formatTimer(remainingSeconds)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3.75 self-start pt-[clamp(24px,8dvh,68px)]">
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
              <StopIcon />
            )}
            <span>
              {snapshot.status === "paused" ? "다시 시작하기" : "멈추기"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              // 클릭 시점 기록 — 타이머 화면에서 [조기완료]
              track({
                type: "mission_complete_click",
                source: "timer_screen",
                timerAction: "early_complete",
              });
              void onAction("early_complete");
            }}
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

// 멈추기 아이콘 — Figma 6009:13171 (원 안의 둥근 사각형)
function StopIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden>
      <path
        fill="currentColor"
        d="M10 1.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17ZM8.5 6.5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-3Z"
      />
    </svg>
  );
}
