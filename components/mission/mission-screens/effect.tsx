"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ApiError,
  getStoredSelectedChildId,
  loadCurrentMission,
  loadMissionExecutionEffect,
  type MissionEffectLoadState,
  type MissionLoadState,
} from "@/lib/api";
import {
  HeaderSpacer,
  MISSION_IMAGE_PATH,
  MissionContentSkeleton,
  MissionErrorState,
  MissionHeader,
} from "./shared";

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
    <div className="min-h-dvh bg-[#fbfbfb] px-5 pb-[max(20px,env(safe-area-inset-bottom))] text-gray-800">
      <MissionHeader childLabel={childLabel} onBack={() => router.push("/")} />
      <HeaderSpacer />

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
