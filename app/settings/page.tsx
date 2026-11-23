"use client";

import { BottomNav } from "@/components/app/bottom-nav";
import { MainShellReportProvider } from "@/components/app/main-shell-report-context";
import { Mascot } from "@/components/characters/mascot";
// 마이페이지 — 카드형(Figma 02 마이페이지). 목록형(MyPageList)은 시안으로 남겨 둔다.
import { MyPageCard as MyPage } from "@/components/settings/my-page-variants";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { api, ApiError, getMyReferral } from "@/lib/api";
import { notifyMobile, openExternalUrl } from "@/lib/native-bridge";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ApiInterestId } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearStoredSelectedChildId } from "@/lib/api/storage";
import { forgetOnboarded } from "@/lib/onboarded-cookie";

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [interests, setInterests] = useState<ApiInterestId[]>([]);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [referralProgress, setReferralProgress] = useState<string>();

  useEffect(() => {
    track({ type: "settings_open" });
    void (async () => {
      try {
        const me = await api.getMe();
        setName(me.name ?? "");
        setInterests(me.interests ?? []);
      } catch {
        // 내 정보 조회 실패 — 이름·관심사 없이 표시
      }
    })();
    // 친구 초대 진행 "1/4명" — 실패하면 숫자 없이 줄만 보인다
    void getMyReferral()
      .then((r) => setReferralProgress(`${Math.min(r.joinedCount, r.goal)}/${r.goal}명`))
      .catch(() => undefined);
  }, []);

  const onLogout = async () => {
    track({ type: "settings_logout" });
    notifyMobile({ type: "LOGOUT" });
    clearStoredSelectedChildId();
    forgetOnboarded();
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/onboarding/intro");
  };

  // 하단 탭 "마이" 화면 — 탭으로 오가므로 닫기(X) 없이 하단 바를 함께 띄운다.
  return (
    <MainShellReportProvider>
      <div className="pb-[calc(96px+env(safe-area-inset-bottom))]">
      <MyPage
        name={name}
        interests={interests}
        favoritesHref="/mission/saved"
        onOpenReferral={() => router.push("/referral?from=settings")}
        referralProgress={referralProgress}
        onLogout={() => void onLogout()}
        onDeleteAccount={() => setDeletingAccount(true)}
        onOpenPrivacy={() =>
          openExternalUrl(`${window.location.origin}/policy/privacy`)
        }
        onOpenTerms={() =>
          openExternalUrl(`${window.location.origin}/policy/terms`)
        }
      />
      </div>
      {/* 문의하기 플로팅 버튼 — 하단 탭 바로 위 오른쪽 (Figma 02-1) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(115px+env(safe-area-inset-bottom))] z-30 mx-auto flex w-full max-w-97.5 justify-end px-5">
        <button
          type="button"
          onClick={() => {
            track({ type: "settings_shortcut_click", target: "inquiry_fab" });
            router.push("/settings/inquiries");
          }}
          aria-label="문의하기"
          className="pointer-events-auto flex size-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#B69CFE_0%,#9572FF_55%,#7850FF_100%)] shadow-[0_8px_20px_rgba(120,80,255,0.35)] transition-transform active:scale-95"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/figma/mypage/fab-inquiry.svg" alt="" className="size-8" aria-hidden />
        </button>
      </div>
      <BottomNav />
      {deletingAccount ? (
        <DeleteAccountModal onClose={() => setDeletingAccount(false)} />
      ) : null}
    </MainShellReportProvider>
  );
}

function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.deleteAccount();
      track({ type: "settings_account_delete_confirm" });
      notifyMobile({ type: "LOGOUT" });
      clearStoredSelectedChildId();
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.replace("/onboarding/intro");
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.status === 409
            ? "이미 탈퇴 처리되었습니다."
            : `탈퇴 실패 (${e.status})`
          : "네트워크 오류";
      setError(message);
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-6"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-83.5 flex-col rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3 px-4 pt-6 pb-2">
          <Mascot pose="question" className="w-20.5" />
          <p className="pt-2 text-center text-lg font-bold leading-[1.4] text-gray-800">
            계정을 탈퇴하시겠어요?
          </p>
          <p className="px-2 text-center text-sm leading-normal text-gray-500">
            탈퇴 시 아이 성장 기록, 저장된 데이터 및 활동 내역이 영구적으로
            삭제되며 복구할 수 없습니다. 신중히 확인 후 진행해주세요.
          </p>
        </div>
        {error ? (
          <p className="px-4 pb-2 text-center text-xs text-red-500">{error}</p>
        ) : null}
        <div className="flex flex-col gap-2 px-4 pt-2 pb-5">
          <Button size="full" onClick={onClose} disabled={busy}>
            취소하기
          </Button>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={busy}
            className="h-12 text-sm font-medium text-gray-300 disabled:opacity-50"
          >
            {busy ? "처리 중..." : "계정 탈퇴하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
