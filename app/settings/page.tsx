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
        // interests fetch 실패 — 빈 칩
      }
    })();
  }, []);

  const onLogout = async () => {
    track({ type: "settings_logout" });
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/onboarding");
  };

  return (
    <div className="flex flex-col">
      {/* Figma 2395:8866 헤더 — h-78 px-20 */}
      <header className="flex h-[78px] items-center justify-between px-5">
        <div className="flex w-[182.5px] items-center gap-2">
          <SettingsIcon className="size-6 text-gray-800" />
          <h1 className="text-xl font-bold tracking-[-0.4px] text-gray-800">
            설정
          </h1>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="닫기"
          className="flex size-11 items-center justify-center text-gray-700"
        >
          <X className="size-6" />
        </button>
      </header>

      {/* Figma 2395:8873 본문 — pt-20 pb-40 px-20, 섹션 gap-24 */}
      <div className="flex flex-col gap-6 px-5 pt-5 pb-10">
        <Section title="설정">
          <Row
            href="/settings/notifications"
            icon={Bell}
            title="미션 알림"
            subtitle="오늘의 제안을 놓치지 마세요"
            divider
          />
          <Row
            href="/settings/interests"
            icon={Flag}
            title="관심사 수정"
            subtitle={`${interests.length}개 선택됨`}
            extra={
              interests.length > 0 ? (
                <div className="flex flex-wrap gap-2 pl-9 pt-1">
                  {interests.map((id) => (
                    <span
                      key={id}
                      className="rounded-full bg-primary-50 px-2 py-1 text-xs font-medium leading-[1.4] text-primary-400"
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
          <Row
            href="/settings/profile"
            icon={User}
            title="내 프로필 수정"
            divider
          />
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
            divider
          />
          <Row onClick={onLogout} icon={LogOut} title="로그아웃" />
        </Section>

        <Section title="기타">
          <Row
            href="/policy/privacy"
            icon={FileText}
            title="개인정보 보호정책"
            divider
          />
          <Row href="/policy/terms" icon={ScrollText} title="서비스 약관" />
        </Section>
      </div>

      {deletingAccount ? (
        <DeleteAccountModal onClose={() => setDeletingAccount(false)} />
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-bold leading-[1.4] text-gray-800">
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
  divider?: boolean;
} & ({ href: string; onClick?: never } | { onClick: () => void; href?: never });

function Row({
  icon: Icon,
  title,
  subtitle,
  extra,
  divider,
  ...action
}: RowProps) {
  const body = (
    <div className="flex w-full items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <Icon className="size-6 shrink-0 text-gray-700" />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium leading-[1.4] text-gray-800">
            {title}
          </span>
          {subtitle ? (
            <span className="text-xs leading-[1.4] text-gray-500">
              {subtitle}
            </span>
          ) : null}
        </div>
      </div>
      <ChevronRight className="size-6 shrink-0 text-gray-700" />
    </div>
  );
  const inner = (
    <>
      {"href" in action && action.href ? (
        <Link href={action.href} className="block">
          {body}
        </Link>
      ) : (
        <button
          type="button"
          onClick={action.onClick}
          className="block w-full text-left"
        >
          {body}
        </button>
      )}
      {extra}
      {divider ? <div className="h-px bg-gray-100" /> : null}
    </>
  );
  return inner;
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
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.replace("/onboarding");
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
        className="flex w-full max-w-[334px] flex-col rounded-[20px] bg-white"
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
            className="h-12 text-sm font-medium text-gray-300 disabled:opacity-50"
          >
            {busy ? "처리 중..." : "계정 탈퇴하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
