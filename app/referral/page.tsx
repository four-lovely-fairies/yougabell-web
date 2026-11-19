"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  ReferralSkeleton,
  ReferralView,
  ShareSheet,
} from "@/components/referral/referral-views";
import { track } from "@/lib/analytics";
import { getMyReferral, type MyReferral } from "@/lib/api/referral";
import { preloadKakao } from "@/lib/kakao-share";
import { shareInviteCode } from "@/lib/referral";

type Entry = "home_popup" | "settings" | "notification" | "direct";
const ENTRIES: Entry[] = ["home_popup", "settings", "notification", "direct"];

// 03·05·06 친구 초대 이벤트 — 진행 현황 + 공유 시트(04).
export default function ReferralPage() {
  return (
    <Suspense>
      <ReferralScreen />
    </Suspense>
  );
}

function ReferralScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const [data, setData] = useState<MyReferral | null>(null);
  const [failed, setFailed] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // 푸시·알림으로 앱이 이 화면부터 열리면 로그인 세션이 조금 늦게 붙는다 → 몇 번 다시 시도한다.
    const load = async (): Promise<MyReferral> => {
      for (let attempt = 0; ; attempt += 1) {
        try {
          return await getMyReferral();
        } catch (error) {
          if (attempt >= 3 || cancelled) throw error;
          await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
        }
      }
    };
    load()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        const raw = params.get("from") as Entry | null;
        track({
          type: "referral_view",
          entry: raw && ENTRIES.includes(raw) ? raw : "direct",
          joinedCount: result.joinedCount,
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [params]);

  const back = () => {
    if (window.history.length > 1) router.back();
    else router.replace("/");
  };

  if (!data) {
    if (!failed) return <ReferralSkeleton onBack={back} />;
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-gray-500">
          친구 초대 정보를 불러오지 못했어요.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="h-11 rounded-full bg-gray-800 px-5 text-sm font-semibold text-white"
        >
          다시 불러오기
        </button>
      </div>
    );
  }

  const reached = data.joinedCount >= data.goal;

  return (
    <>
      <ReferralView
        data={data}
        onBack={back}
        onPrimary={() => {
          if (reached && !data.rewardClaim) {
            router.push("/referral/coupon");
            return;
          }
          track({ type: "referral_invite_click" });
          // 카카오 SDK를 미리 불러 두면 [카카오톡으로 보내기]가 바로 뜬다.
          preloadKakao();
          setSharing(true);
        }}
      />
      {sharing ? (
        <ShareSheet
          onClose={() => setSharing(false)}
          onSelect={(method) => {
            track({ type: "referral_share", method });
            setSharing(false);
            void shareInviteCode(method, data.code);
          }}
        />
      ) : null}
    </>
  );
}
