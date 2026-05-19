"use client";

import {
  Bell,
  ChevronRight,
  FileText,
  Flag,
  LogOut,
  ScrollText,
  Settings as SettingsIcon,
  Smile,
  User,
  UserMinus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  INTEREST_API_TO_WEB,
  INTEREST_LABEL,
  type ApiInterestId,
} from "@/lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const [interests, setInterests] = useState<ApiInterestId[]>([]);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    track({ type: "settings_open" });
    void (async () => {
      try {
        const me = await api.getMe();
        setInterests(me.interests ?? []);
      } catch {
        // interests fetch 실패 — 빈 칩 표시
      }
    })();
  }, []);

  const onLogout = async () => {
    track({ type: "settings_logout" });
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/onboarding/intro");
  };

  return (
    <div className="flex flex-col pb-10">
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <SettingsIcon className="size-6 text-gray-800" />
          <h1 className="text-xl font-bold text-gray-800">설정</h1>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="닫기"
          className="-mr-1 p-1 text-gray-700"
        >
          <X className="size-6" />
        </button>
      </header>

      <Section title="설정">
        <Row
          href="/settings/notifications"
          icon={Bell}
          title="미션 알림"
          subtitle="오늘의 제안을 놓치지 마세요"
        />
        <Row
          href="/settings/interests"
          icon={Flag}
          title="관심사 수정"
          subtitle={`${interests.length}개 선택됨`}
          extra={
            interests.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {interests.map((id) => (
                  <span
                    key={id}
                    className="rounded-full bg-[#efe7ff] px-2.5 py-1 text-xs font-medium text-[#9572ff]"
                  >
                    #{INTEREST_LABEL[INTEREST_API_TO_WEB[id]]}
                  </span>
                ))}
              </div>
            ) : null
          }
        />
      </Section>

      <Section title="설정">
        <Row href="/settings/profile" icon={User} title="내 프로필 수정" />
        <Row
          href="/settings/children"
          icon={Smile}
          title="아이 프로필 추가/수정"
        />
      </Section>

      <Section title="계정 및 구독">
        <Row
          onClick={() => setDeletingAccount(true)}
          icon={UserMinus}
          title="계정 탈퇴"
        />
        <Row onClick={onLogout} icon={LogOut} title="로그아웃" />
      </Section>

      <Section title="기타">
        <Row href="/policy/privacy" icon={FileText} title="개인정보 보호정책" />
        <Row href="/policy/terms" icon={ScrollText} title="서비스 약관" />
      </Section>

      {deletingAccount ? (
        <DeleteAccountModal onClose={() => setDeletingAccount(false)} />
      ) : null}
    </div>
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
      // soft delete 후 세션 종료
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
        className="flex w-full max-w-[334px] flex-col rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3 px-4 pt-6 pb-2">
          {/* Figma 2395:8988 image — intro sprite 마스코트 캐릭터 */}
          <div className="relative h-[67px] w-[82px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/onboarding/intro.png"
              alt=""
              aria-hidden
              className="absolute left-[-23.76%] top-[-20.27%] h-[381.08%] w-[381.22%] max-w-none"
            />
          </div>
          <p className="pt-2 text-center text-lg font-bold leading-[1.4] text-gray-800">
            계정을 탈퇴하시겠어요?
          </p>
          <p className="px-2 text-center text-sm leading-[1.5] text-gray-500">
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
            className="h-12 text-sm font-medium text-gray-500 disabled:opacity-50"
          >
            {busy ? "처리 중..." : "계정 탈퇴하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col">
      <h2 className="px-5 pt-5 pb-2 text-sm font-bold text-gray-800">
        {title}
      </h2>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

type RowProps = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  extra?: ReactNode;
} & ({ href: string; onClick?: never } | { onClick: () => void; href?: never });

function Row({ icon: Icon, title, subtitle, extra, ...action }: RowProps) {
  const content = (
    <>
      <Icon className="size-6 shrink-0 text-gray-700" />
      <div className="flex flex-1 flex-col">
        <span className="text-base font-medium text-gray-800">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 text-xs text-gray-500">{subtitle}</span>
        ) : null}
        {extra}
      </div>
      <ChevronRight className="size-6 shrink-0 text-gray-400" />
    </>
  );
  const className =
    "flex w-full items-start gap-3 border-b border-gray-100 px-5 py-4 text-left transition-colors hover:bg-gray-50";

  if ("href" in action && action.href) {
    return (
      <Link href={action.href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={className}>
      {content}
    </button>
  );
}
