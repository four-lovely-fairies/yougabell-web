"use client";

import { Mascot } from "@/components/characters/mascot";
import {
  applyMissionExecutionAction,
  getStoredSelectedChildId,
  listFavoritePlays,
  loadCurrentMission,
  readSelectedPlay,
  setPlayFavorite,
  startMissionExecution,
  type LibraryPlayItem,
  type MissionLoadState,
} from "@/lib/api";
import { track } from "@/lib/analytics";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  HeaderSpacer,
  MISSION_META_ICONS,
  MissionHeader,
  MissionIntroSkeleton,
  MissionMetaRow,
  MissionSourceSheet,
} from "../mission-screens/shared";
import { FavoriteSavedToast } from "./shared";

const DISSOLVE = "animate-dissolve motion-reduce:animate-none";
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

// Figma 04-2 관심 놀이에서 진입 — 놀이 상세. 오늘의 놀이가 아니어도 다시 해볼 수 있다.
export function SavedPlayDetailScreen({ missionId }: { missionId: string }) {
  const router = useRouter();
  const [play, setPlay] = useState<LibraryPlayItem | null | undefined>(undefined);
  const [context, setContext] = useState<MissionLoadState | null>(null);
  const [busy, setBusy] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const enteredAtRef = useRef<number | null>(null);

  useEffect(() => {
    enteredAtRef.current = Date.now();
    let cancelled = false;
    void (async () => {
      const [selected, ctx] = await Promise.all([
        (async () => {
          const remembered = readSelectedPlay(missionId);
          if (remembered) return remembered;
          // 바로 들어온 경우(새로고침 등) 관심 놀이 목록에서 다시 찾는다.
          try {
            const list = await listFavoritePlays({});
            return list.items.find((item) => item.missionId === missionId) ?? null;
          } catch {
            return null;
          }
        })(),
        loadCurrentMission(getStoredSelectedChildId()),
      ]);
      if (cancelled) return;
      setPlay(selected);
      setContext(ctx);
    })();
    return () => {
      cancelled = true;
    };
  }, [missionId]);

  const leave = () => {
    if (window.history.length > 1) window.history.back();
    else router.push("/mission/saved");
  };

  if (play === undefined || !context) return <MissionIntroSkeleton />;

  if (!play) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-[#fbfbfb] px-5 text-center">
        <p className="text-base font-bold text-gray-800">놀이 정보를 찾을 수 없어요</p>
        <button
          type="button"
          onClick={() => router.replace("/mission/saved")}
          className="h-12 rounded-2xl bg-primary-300 px-6 text-sm font-medium text-white"
        >
          관심 놀이로 가기
        </button>
      </div>
    );
  }

  const child = context.data.selectedChild;

  const toggleFavorite = async () => {
    const next = !play.isFavorite;
    setFavoriteBusy(true);
    setPlay({ ...play, isFavorite: next });
    try {
      await setPlayFavorite(play.missionId, next);
      track({ type: "play_favorite_toggle", action: next ? "add" : "remove", source: "saved_detail" });
      setToastOpen(next);
    } catch {
      setPlay({ ...play, isFavorite: !next });
    } finally {
      setFavoriteBusy(false);
    }
  };

  // 실행을 시작한다. 다른 놀이가 진행 중이면 그 놀이부터 마치도록 안내한다.
  const start = async (startMode: "timer" | "direct") => {
    const started = await startMissionExecution({
      childId: child.id,
      missionId: play.missionId,
      durationMinutes: play.durationMinutes,
    });
    if (started.source === "api" && started.execution.missionId !== play.missionId) {
      throw new Error("OTHER_ACTIVE");
    }
    track({ type: "mission_start", startMode, entry: "saved" });
    return started;
  };

  const run = async (action: "timer" | "done") => {
    // 클릭 시점 기록 — 관심 놀이·놀이 내역 상세에서 들어온 경우
    track(
      action === "timer"
        ? { type: "mission_timer_start_click", entry: "saved" }
        : { type: "mission_complete_click", source: "detail_direct", entry: "saved" },
    );
    setBusy(true);
    setError(null);
    try {
      const started = await start(action === "timer" ? "timer" : "direct");
      if (action === "timer") {
        router.push(`/mission/timer?executionId=${started.execution.id}&mode=${started.source}`);
        return;
      }
      const elapsedSeconds =
        enteredAtRef.current === null
          ? undefined
          : Math.floor((Date.now() - enteredAtRef.current) / 1000);
      const completed = await applyMissionExecutionAction({
        executionId: started.execution.id,
        action: "complete",
        mode: started.source,
        elapsedSeconds,
      });
      track({
        type: "mission_complete",
        completionType: "manual",
        source: "detail_direct",
        entry: "saved",
        elapsedSeconds,
      });
      router.push(`/mission/effect?executionId=${started.execution.id}&mode=${completed.source}`);
    } catch (e) {
      setError(
        e instanceof Error && e.message === "OTHER_ACTIVE"
          ? "진행 중인 놀이가 있어요. 먼저 그 놀이를 마쳐 주세요."
          : "놀이를 시작하지 못했어요. 다시 시도해 주세요.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex h-dvh flex-col overflow-x-clip bg-[#fbfbfb] px-5 pb-[max(20px,env(safe-area-inset-bottom))] text-gray-800">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-20 h-64 w-[130%] -translate-x-1/2 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(149,114,255,0.18),rgba(149,114,255,0))] blur-2xl"
      />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <MissionHeader
          childLabel={`${child.name} (${child.ageLabel})`}
          onBack={leave}
          favorite={{ on: play.isFavorite, onToggle: () => void toggleFavorite(), busy: favoriteBusy }}
        />
        <HeaderSpacer />

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-y-auto py-4">
          <div className={DISSOLVE} style={delay(0)}>
            <Mascot pose="resting" className="w-27.5" />
          </div>
          <div className={`flex w-full flex-col items-center gap-5 text-center ${DISSOLVE}`} style={delay(80)}>
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-xs font-medium leading-[1.4] text-primary-300">
                아이와 {play.durationLabel} 가까워지기
              </p>
              <h1 className="text-2xl font-semibold leading-8 text-gray-800">{play.title}</h1>
            </div>
            <p className="max-w-80 whitespace-pre-line text-sm leading-[1.4] text-gray-600">
              {play.description}
            </p>
          </div>
          <div
            className={`flex w-full flex-col gap-4 rounded-[24px] border border-[#f4f4f4] bg-white px-6 py-5 ${DISSOLVE}`}
            style={delay(160)}
          >
            <MissionMetaRow icon={MISSION_META_ICONS.time} label="시간" value={play.durationLabel} />
            <MissionMetaRow icon={MISSION_META_ICONS.category} label="카테고리" value={play.categoryLabel} />
            {play.sourceLabel ? (
              <MissionMetaRow
                icon={MISSION_META_ICONS.source}
                label="출처"
                value={play.sourceLabel}
                onClick={() => setSourceOpen(true)}
              />
            ) : null}
          </div>
        </div>

        <div className={`flex shrink-0 flex-col items-center gap-4 pt-5 ${DISSOLVE}`} style={delay(240)}>
          {error ? (
            <p role="alert" className="text-center text-sm font-medium text-error-500">
              {error}
            </p>
          ) : null}
          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={() => void run("timer")}
              disabled={busy}
              className="flex h-13.5 w-28 shrink-0 items-center justify-center gap-1 rounded-2xl bg-[#f2f2f4] text-base font-medium leading-[1.4] text-[#55555a]"
            >
              <Image src="/icons/figma/mission/timer.svg" alt="" width={20} height={20} />
              타이머
            </button>
            <button
              type="button"
              onClick={() => void run("done")}
              disabled={busy}
              className="flex h-13.5 min-w-0 flex-1 items-center justify-center rounded-2xl bg-primary-300 text-base font-medium leading-[1.4] text-white disabled:bg-primary-100"
            >
              놀이 다 했어요
            </button>
          </div>
        </div>
      </div>
      {toastOpen ? <FavoriteSavedToast onClose={() => setToastOpen(false)} /> : null}
      {sourceOpen ? (
        <MissionSourceSheet citation={play.sourceLabel} onClose={() => setSourceOpen(false)} />
      ) : null}
    </div>
  );
}
