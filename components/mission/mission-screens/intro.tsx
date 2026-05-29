"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getStoredSelectedChildId,
  loadCurrentMission,
  startMissionExecution,
  type MissionLoadState,
} from "@/lib/api";
import {
  MISSION_IMAGE_PATH,
  MissionHeader,
  MissionIntroSkeleton,
  MissionMetaRow,
} from "./shared";

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
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-safe text-gray-800">
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
