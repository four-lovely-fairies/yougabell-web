'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Mascot } from '@/components/characters/mascot';
import {
  ApiError,
  getStoredSelectedChildId,
  loadCurrentMission,
  loadMissionExecutionEffect,
  type MissionEffectLoadState,
  type MissionLoadState,
} from '@/lib/api';
import {
  HeaderSpacer,
  MissionContentSkeleton,
  MissionErrorState,
  MissionHeader,
} from './shared';

function getEffectLabel(effect: string, fallback: string) {
  const normalized = effect.replace(/\s+/g, ' ').trim();
  const quoted = normalized.match(/[“"]([^”"]+)[”"]/);

  if (quoted?.[1]) {
    return quoted[1];
  }

  const childEffect = normalized.match(/아이의\s*([^과와,.]+)(?:과|와)/);

  if (childEffect?.[1]) {
    return childEffect[1].trim();
  }

  const objectPhrase = normalized.match(/^(.{2,18}?)(?:을|를)\s/);

  if (objectPhrase?.[1]) {
    return objectPhrase[1].trim();
  }

  return fallback;
}

export function MissionEffectScreen({
  executionId,
  mode,
}: {
  executionId: string | null;
  mode: 'api' | 'demo' | null;
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
        router.replace('/mission');
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
            ? '미션 효과 정보를 불러오지 못했어요.'
            : 'API 서버에 연결할 수 없습니다.',
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
        message={error ?? '미션 효과 정보를 불러오지 못했어요.'}
        onBack={() => router.push('/')}
      />
    );
  }

  const childLabel = missionState
    ? `${missionState.data.selectedChild.name} (${missionState.data.selectedChild.ageLabel})`
    : '아이';
  const mission = state.data.mission;
  const effectLabel = getEffectLabel(mission.effect, mission.title);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#fbfbfb] px-5 pb-[max(20px,env(safe-area-inset-bottom))] text-gray-800">
      <div
        className="pointer-events-none absolute left-1/2 top-[252px] h-63.25 w-141 -translate-x-1/2 rounded-full opacity-70 blur-[64px]"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(149,114,255,0.12) 0%, rgba(149,114,255,0.04) 55%, rgba(149,114,255,0) 100%)',
        }}
        aria-hidden
      />
      <MissionHeader childLabel={childLabel} onBack={() => router.push('/')} />
      <HeaderSpacer />

      <div className="relative z-10 flex min-h-[calc(100dvh-103px-96px)] flex-col items-center justify-center gap-6">
        <Mascot pose="resting" className="w-27.5" />
        <div className="space-y-3.75 text-center">
          <h1 className="text-[20px] font-bold leading-[1.4] tracking-[-0.4px] text-gray-800">
            아이의 “{effectLabel}”에
            <br />
            도움이 되는 시간이었어요.
          </h1>
          <p className="text-sm leading-[1.4] text-gray-600">
            오늘 하루도 수고하셨습니다!
          </p>
        </div>
        <div className="flex w-full flex-col items-start justify-center gap-2 rounded-[24px] border border-[#f4f4f4] bg-white px-6 py-5">
          <p className="text-xs font-medium leading-[1.4] text-black/50">
            효과
          </p>
          <p className="whitespace-pre-line text-sm leading-[1.4] text-black">
            {mission.effect}
          </p>
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
