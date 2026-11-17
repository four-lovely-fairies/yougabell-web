"use client";

import { Mascot } from "@/components/characters/mascot";
// 마이페이지 시안 — 지금은 목록형(MyPageList). 카드형으로 바꾸려면 MyPageCard로 교체하면 된다.
import { MyPageList as MyPage } from "@/components/settings/my-page-variants";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { api, ApiError } from "@/lib/api";
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

  return (
    <>
      <MyPage
        name={name}
        interests={interests}
        favoritesHref="/mission/saved"
        onClose={() => router.replace("/")}
        onLogout={() => void onLogout()}
        onDeleteAccount={() => setDeletingAccount(true)}
        onOpenPrivacy={() =>
          openExternalUrl(`${window.location.origin}/policy/privacy`)
        }
        onOpenTerms={() =>
          openExternalUrl(`${window.location.origin}/policy/terms`)
        }
      />
      {deletingAccount ? (
        <DeleteAccountModal onClose={() => setDeletingAccount(false)} />
      ) : null}
    </>
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
