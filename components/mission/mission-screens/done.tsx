"use client";

import { ArrowLeft, CalendarDays, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getStoredSelectedChildId,
  loadCurrentMission,
  loadMissionExecutionEffect,
  type MissionEffectLoadState,
  type MissionLoadState,
} from "@/lib/api";
import { Mascot } from "@/components/characters/mascot";
import { MissionContentSkeleton } from "./shared";

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
    <div className="relative min-h-dvh overflow-hidden bg-[#fbfbfb] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-safe text-gray-800">
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
          <Mascot pose="resting" className="w-27.5" />
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
