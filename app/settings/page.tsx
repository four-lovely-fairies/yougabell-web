"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
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
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// TODO(api): /me API에 interests 포함되면 실제 데이터 연결. 1차에선 mock.
const INTEREST_CHIPS = ["정서발달", "창의놀이", "수면교육"];

export default function SettingsPage() {
  const router = useRouter();

  const onLogout = async () => {
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
          subtitle={`최대 ${INTEREST_CHIPS.length}개 선택됨`}
          extra={
            <div className="mt-2 flex flex-wrap gap-1.5">
              {INTEREST_CHIPS.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-[#efe7ff] px-2.5 py-1 text-xs font-medium text-[#9572ff]"
                >
                  #{label}
                </span>
              ))}
            </div>
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
          href="/settings/account-delete"
          icon={UserMinus}
          title="계정 탈퇴"
        />
        <Row onClick={onLogout} icon={LogOut} title="로그아웃" />
      </Section>

      <Section title="기타">
        <Row href="/policy/privacy" icon={FileText} title="개인정보 보호정책" />
        <Row href="/policy/terms" icon={ScrollText} title="서비스 약관" />
      </Section>
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
      <ChevronRight className="size-5 shrink-0 text-gray-400" />
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
