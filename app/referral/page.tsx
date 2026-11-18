"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  ReferralView,
  ShareSheet,
} from "@/components/referral/referral-views";
import { track } from "@/lib/analytics";
import { getMyReferral, type MyReferral } from "@/lib/api/referral";
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
    getMyReferral()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        const raw = params.get("from") as Entry | null;
        // 알림에서 들어오면 targetUrl(/referral)에 from이 없다 → direct로 남는다.
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
    return (
      <div className="grid h-dvh place-items-center px-6 text-center text-sm text-gray-500">
        {failed ? "친구 초대 정보를 불러오지 못했어요." : "불러오는 중…"}
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
