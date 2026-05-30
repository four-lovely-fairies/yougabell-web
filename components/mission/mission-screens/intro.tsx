"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  api,
  getStoredSelectedChildId,
  loadCurrentMission,
  setStoredSelectedChildId,
  startMissionExecution,
  type MissionLoadState,
} from "@/lib/api";
import type { MissionSelectedChild } from "@/lib/mission-data";
import {
  ageLabelFromBirth,
  ChildSwitchDropdown,
  MISSION_IMAGE_PATH,
  MISSION_META_ICONS,
  MissionHeader,
  MissionIntroSkeleton,
  MissionMetaRow,
  MissionSourceSheet,
  type MissionSwitchChild,
} from "./shared";

async function loadSwitchChildren(
  selected: MissionSelectedChild,
): Promise<MissionSwitchChild[]> {
  try {
    const me = await api.getMe();
    if (me.children.length > 0) {
      return me.children.map((child) => ({
        id: child.id,
        name: child.name,
        ageLabel:
          child.id === selected.id
            ? selected.ageLabel
            : ageLabelFromBirth(child.birthDate),
      }));
    }
  } catch {
    // 데모/비로그인 — 단일 자녀로 폴백
  }
  return [
    { id: selected.id, name: selected.name, ageLabel: selected.ageLabel },
  ];
}

export function MissionIntroScreen() {
  const router = useRouter();
  const [state, setState] = useState<MissionLoadState | null>(null);
  const [children, setChildren] = useState<MissionSwitchChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      const next = await loadCurrentMission(getStoredSelectedChildId());
      if (cancelled) return;

      setState(next);
      setLoading(false);

      if (next.data.activeExecution?.status === "in_progress") {
        router.replace(
          `/mission/timer?executionId=${next.data.activeExecution.id}&mode=${next.source}`,
        );
        return;
      }

      const list = await loadSwitchChildren(next.data.selectedChild);
      if (!cancelled) setChildren(list);
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

  const onSelectChild = async (child: MissionSwitchChild) => {
    setSwitcherOpen(false);
    if (!state || child.id === state.data.selectedChild.id) return;

    setStoredSelectedChildId(child.id);
    setLoading(true);
    const next = await loadCurrentMission(child.id);
    setState(next);
    setLoading(false);

    if (next.data.activeExecution?.status === "in_progress") {
      router.replace(
        `/mission/timer?executionId=${next.data.activeExecution.id}&mode=${next.source}`,
      );
    }
  };

  const onStart = async () => {
    if (!state?.data || state.data.mission.status === "completed") return;

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
  const canSwitch = children.length > 1;
  const ctaLabel = isCompleted
    ? "미션 완료"
    : activeExecution?.status === "paused"
      ? "이어서 하기"
      : "미션 시작하기";

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#fbfbfb] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-safe text-gray-800">
      {/* Figma ellipse87 — 캐릭터 뒤 보라 글로우 */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-20 h-64 w-[130%] -translate-x-1/2 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(149,114,255,0.18),rgba(149,114,255,0))] blur-2xl"
      />

      <div className="relative z-10 flex flex-1 flex-col">
        <MissionHeader
          childLabel={`${selectedChild.name} (${selectedChild.ageLabel})`}
          onBack={goBack}
          onSwitchChild={canSwitch ? () => setSwitcherOpen(true) : undefined}
        />

        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-4">
          <img
            src={MISSION_IMAGE_PATH}
            alt=""
            className="h-23 w-27.5 object-contain"
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

          <div className="flex w-full flex-col gap-4 rounded-[24px] border border-[#f4f4f4] bg-white px-6 py-5">
            <MissionMetaRow
              icon={MISSION_META_ICONS.time}
              label="시간"
              value={mission.durationLabel}
            />
            <MissionMetaRow
              icon={MISSION_META_ICONS.category}
              label="카테고리"
              value={mission.categoryLabel}
            />
            <MissionMetaRow
              icon={MISSION_META_ICONS.source}
              label="출처"
              value={mission.sourceLabel}
              onClick={() => setSourceOpen(true)}
            />
            {mission.goalLabel ? (
              <MissionMetaRow
                icon={MISSION_META_ICONS.goal}
                label="목표"
                value={mission.goalLabel}
              />
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 pt-5">
          {state.message ? (
            <p className="text-center text-xs leading-4 text-gray-400">
              {state.message}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setSourceOpen(true)}
              className="text-sm font-medium leading-[1.4] text-gray-500 underline-offset-2 hover:underline"
            >
              출처 자세히 보기
            </button>
          )}
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

      {switcherOpen ? (
        <ChildSwitchDropdown
          childItems={children}
          selectedChildId={selectedChild.id}
          onSelect={onSelectChild}
          onClose={() => setSwitcherOpen(false)}
        />
      ) : null}

      {sourceOpen ? (
        <MissionSourceSheet
          sourceLabel={mission.sourceLabel}
          onClose={() => setSourceOpen(false)}
        />
      ) : null}
    </div>
  );
}
