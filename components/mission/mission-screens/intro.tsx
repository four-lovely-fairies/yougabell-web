"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { useScreenPerformance } from "@/hooks/use-screen-performance";
import { Mascot } from "@/components/characters/mascot";
import {
  api,
  applyMissionExecutionAction,
  getStoredSelectedChildId,
  loadCurrentMission,
  isDemoFavorite,
  setPlayFavorite,
  setStoredSelectedChildId,
  startMissionExecution,
  type MissionLoadState,
} from "@/lib/api";
import type { MissionSelectedChild } from "@/lib/mission-data";
import {
  ageLabelFromBirth,
  ChildSwitchSheet,
  HeaderSpacer,
  MISSION_META_ICONS,
  MissionHeader,
  MissionIntroSkeleton,
  MissionMetaRow,
  MissionSourceSheet,
  type MissionSwitchChild,
} from "./shared";
import { FavoriteSavedToast } from "../library/shared";
import { BottomSheet } from "@/components/ui/bottom-sheet";

// 놀이 화면 진입 연출 — 과하지 않게 디졸브만, 위에서 아래 순서로 살짝 시차를 둔다.
const DISSOLVE = "animate-dissolve motion-reduce:animate-none";
const dissolveDelay = (ms: number) => ({ animationDelay: `${ms}ms` });

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
  const [exitSheetOpen, setExitSheetOpen] = useState(false);
  // 타이머 없이 완료할 때 놀이 시간 = 이 화면에 들어온 뒤 완료 버튼을 누를 때까지.
  const enteredAtRef = useRef<number | null>(null);
  useEffect(() => {
    enteredAtRef.current = Date.now();
  }, []);
  const [doneError, setDoneError] = useState<string | null>(null);
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  useScreenPerformance(
    "/mission",
    loading || !state || state.data.activeExecution?.status === "in_progress"
      ? "pending"
      : state.source,
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      const next = await loadCurrentMission(getStoredSelectedChildId());
      if (cancelled) return;

      setState(next);
      setFavorite(
        next.source === "demo"
          ? isDemoFavorite(next.data.mission.id)
          : Boolean(next.data.mission.isFavorite),
      );
      setLoading(false);
      track({ type: "mission_view" });

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

  const leave = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    router.push("/");
  };

  // 놀이를 완료하지 않고 나가려 하면 한 번 확인한다 (Figma 03 완료 안 하고 나갈 때).
  const goBack = () => {
    if (state && state.data.mission.status !== "completed") {
      setExitSheetOpen(true);
      return;
    }
    leave();
  };

  const onSelectChild = async (child: MissionSwitchChild) => {
    setSwitcherOpen(false);
    if (!state || child.id === state.data.selectedChild.id) return;

    setStoredSelectedChildId(child.id);
    setLoading(true);
    const next = await loadCurrentMission(child.id);
    setState(next);
    setFavorite(Boolean(next.data.mission.isFavorite));
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
      track({ type: "mission_start" });
      router.push(
        `/mission/timer?executionId=${result.execution.id}&mode=${result.source}`,
      );
    } finally {
      setStarting(false);
    }
  };

  // 타이머 없이 바로 완료 — 실행을 만들고(진행 중인 게 있으면 그걸로) 곧바로 완료 처리한 뒤 놀이 효과로 간다.
  const onDone = async () => {
    if (!state?.data || state.data.mission.status === "completed") return;
    setExitSheetOpen(false);
    setDoneError(null);
    setStarting(true);
    try {
      let executionId = state.data.activeExecution?.id ?? null;
      let source: "api" | "demo" = state.source;
      if (!executionId) {
        const started = await startMissionExecution({
          childId: state.data.selectedChild.id,
          missionId: state.data.mission.id,
          durationMinutes: state.data.mission.durationMinutes,
        });
        executionId = started.execution.id;
        source = started.source;
        track({ type: "mission_start" });
      }
      const completed = await applyMissionExecutionAction({
        executionId,
        action: "complete",
        mode: source,
        elapsedSeconds:
          enteredAtRef.current === null
            ? undefined
            : Math.floor((Date.now() - enteredAtRef.current) / 1000),
      });
      track({ type: "mission_complete", completionType: "manual" });
      router.push(
        `/mission/effect?executionId=${executionId}&mode=${completed.source}`,
      );
    } catch {
      setDoneError("완료 처리에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setStarting(false);
    }
  };

  const saveFavorite = async (on: boolean) => {
    if (!state) return false;
    setFavoriteBusy(true);
    setFavorite(on);
    try {
      await setPlayFavorite(state.data.mission.id, on);
      if (on) setToastOpen(true);
      return true;
    } catch {
      setFavorite(!on);
      return false;
    } finally {
      setFavoriteBusy(false);
    }
  };

  if (loading || !state) {
    return <MissionIntroSkeleton />;
  }

  const { selectedChild, mission, completedExecution } = state.data;
  const isCompleted = mission.status === "completed";
  // Figma 01-2 — 오늘 완료했지만 피드백을 아직 안 남겼으면 피드백 작성으로 안내한다.
  const needsFeedback = isCompleted && completedExecution?.hasFeedback === false;
  const canSwitch = children.length > 1;

  return (
    <div className="relative flex h-dvh flex-col overflow-x-clip bg-[#fbfbfb] px-5 pb-[max(20px,env(safe-area-inset-bottom))] text-gray-800">
      {/* Figma ellipse87 — 캐릭터 뒤 보라 글로우 */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-20 h-64 w-[130%] -translate-x-1/2 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(149,114,255,0.18),rgba(149,114,255,0))] blur-2xl"
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <MissionHeader
          childLabel={`${selectedChild.name} (${selectedChild.ageLabel})`}
          onBack={goBack}
          onSwitchChild={canSwitch ? () => setSwitcherOpen(true) : undefined}
          favorite={{
            on: favorite,
            onToggle: () => void saveFavorite(!favorite),
            busy: favoriteBusy,
          }}
        />
        <HeaderSpacer />

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-y-auto py-4">
          <div className={DISSOLVE} style={dissolveDelay(0)}>
            <Mascot pose="resting" className="w-27.5" />
          </div>
          <div
            className={`flex w-full flex-col items-center gap-5 text-center ${DISSOLVE}`}
            style={dissolveDelay(80)}
          >
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-xs font-medium leading-[1.4] text-primary-300">
                아이와 {mission.durationLabel} 가까워지기
              </p>
              <h1 className="text-2xl font-semibold leading-8 text-gray-800">
                {mission.title}
              </h1>
            </div>
            <p className="max-w-80 whitespace-pre-line text-sm leading-[1.4] text-gray-600">
              {mission.description}
            </p>
          </div>

          <div
            className={`flex w-full flex-col gap-4 rounded-[24px] border border-[#f4f4f4] bg-white px-6 py-5 ${DISSOLVE}`}
            style={dissolveDelay(160)}
          >
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
              onClick={() => setSourceModalOpen(true)}
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

        <div
          className={`flex shrink-0 flex-col items-center gap-4 pt-5 ${DISSOLVE}`}
          style={dissolveDelay(240)}
        >
          {doneError ? (
            <p
              role="alert"
              className="text-center text-sm font-medium text-error-500"
            >
              {doneError}
            </p>
          ) : needsFeedback ? (
            <p className="text-center text-xs leading-[1.4] text-gray-500">
              놀이 완료 · 피드백을 남기면 주간 리포트에 반영돼요
            </p>
          ) : state.message ? (
            <p className="text-center text-xs leading-4 text-gray-400">
              {state.message}
            </p>
          ) : null}
          {/* Figma 01 놀이 상세 — 타이머는 선택, 기본 동작은 "놀이 다 했어요" */}
          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={onStart}
              disabled={starting || isCompleted}
              className="flex h-13.5 w-28 shrink-0 items-center justify-center gap-1 rounded-2xl bg-[#f2f2f4] text-base font-medium leading-[1.4] text-[#55555a] disabled:cursor-not-allowed"
            >
              <Image
                src="/icons/figma/mission/timer.svg"
                alt=""
                width={20}
                height={20}
              />
              타이머
            </button>
            {needsFeedback && completedExecution ? (
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/mission/feedback?executionId=${completedExecution.id}&mode=${state.source}`,
                  )
                }
                className="flex h-13.5 min-w-0 flex-1 items-center justify-center rounded-2xl bg-primary-300 text-base font-medium leading-[1.4] text-white"
              >
                놀이 피드백 작성하기
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void onDone()}
                disabled={starting || isCompleted}
                className="flex h-13.5 min-w-0 flex-1 items-center justify-center rounded-2xl bg-primary-300 text-base font-medium leading-[1.4] text-white disabled:bg-primary-100"
              >
                {isCompleted ? "이미 완료된 놀이에요" : "놀이 다 했어요"}
              </button>
            )}
          </div>
        </div>
      </div>

      {switcherOpen ? (
        <ChildSwitchSheet
          childItems={children}
          selectedChildId={selectedChild.id}
          onSelect={onSelectChild}
          onClose={() => setSwitcherOpen(false)}
        />
      ) : null}

      {sourceModalOpen ? (
        <MissionSourceSheet
          citation={mission.sourceLabel}
          onClose={() => setSourceModalOpen(false)}
        />
      ) : null}

      {exitSheetOpen ? (
        <MissionExitSheet
          busy={starting || favoriteBusy}
          canSave={!favorite}
          onSave={async () => {
            const saved = await saveFavorite(true);
            if (saved) {
              setExitSheetOpen(false);
              // 토스트를 잠깐 보여 준 뒤 나간다.
              window.setTimeout(leave, 900);
            }
          }}
          onDone={() => void onDone()}
          onLeave={() => {
            setExitSheetOpen(false);
            leave();
          }}
          onClose={() => setExitSheetOpen(false)}
        />
      ) : null}

      {toastOpen ? <FavoriteSavedToast onClose={() => setToastOpen(false)} /> : null}
    </div>
  );
}

// Figma 03 — 놀이를 완료하지 않고 나갈 때 확인 시트.
// 이미 관심 놀이에 저장한 놀이면 저장 버튼은 숨긴다.
function MissionExitSheet({
  busy,
  canSave,
  onSave,
  onDone,
  onLeave,
  onClose,
}: {
  busy: boolean;
  canSave: boolean;
  onSave: () => void;
  onDone: () => void;
  onLeave: () => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet
      title="오늘 놀이, 해보셨나요?"
      description="기록을 남기면 주간 리포트에 반영돼요."
      onClose={onClose}
      labelledById="mission-exit-title"
    >
      <div className="flex flex-col gap-6 px-6">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onDone}
            disabled={busy}
            className="flex h-13.5 w-full items-center justify-center rounded-2xl bg-primary-300 text-base font-medium leading-[1.4] text-white disabled:opacity-60"
          >
            네, 다 했어요
          </button>
          {canSave ? (
            <button
              type="button"
              onClick={onSave}
              disabled={busy}
              className="flex h-13.5 w-full items-center justify-center rounded-2xl bg-[#f2f2f4] text-base font-medium leading-[1.4] text-gray-800 disabled:opacity-60"
            >
              아직이요, 관심 놀이에 저장할게요
            </button>
          ) : null}
          <button
            type="button"
            onClick={onLeave}
            className="flex w-full justify-center py-2 text-sm font-medium leading-[1.4] text-gray-400"
          >
            그냥 나가기
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
