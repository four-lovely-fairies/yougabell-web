"use client";

import {
  INTEREST_API_TO_WEB,
  INTEREST_LABEL,
  type ApiInterestId,
} from "@/lib/types";
import {
  ChevronRight,
  FileText,
  Flag,
  LogOut,
  MessageCircleQuestion,
  ScrollText,
  Smile,
  User,
  UserMinus,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { track } from "@/lib/analytics";
import { ReferralSettingsCard } from "@/components/referral/referral-views";

// 마이페이지 시안 — 카드형 / 목록형. 둘 다 같은 데이터·동작을 받는다.
// 놀이 내역 · 관심 놀이 · 알림 설정 바로가기가 핵심. 친구 초대 배너는 화면이 생기면 추가한다.
export type MyPageProps = {
  name: string;
  interests: ApiInterestId[];
  favoritesHref: string;
  /** 없으면 닫기(X)를 그리지 않는다 — 하단 탭 "마이"로 들어온 화면. */
  onClose?: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  /** 친구 초대하기 카드 (설정 맨 위 상시 진입점) */
  onOpenReferral?: () => void;
};

const ICON = "/icons/figma/mypage";

const interestSummary = (interests: ApiInterestId[]) => {
  if (interests.length === 0) return "";
  const first = INTEREST_LABEL[INTEREST_API_TO_WEB[interests[0]]];
  return interests.length > 1 ? `${first} 외 ${interests.length - 1}` : first;
};

type Action = { href: string; onClick?: never } | { onClick: () => void; href?: never };

function Pressable({
  action,
  className,
  children,
}: {
  action: Action;
  className: string;
  children: ReactNode;
}) {
  if (action.href) {
    return (
      <Link href={action.href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={`${className} text-left`}>
      {children}
    </button>
  );
}

/* ───────────── 공통: 이름 헤더 + 바로가기 ───────────── */

function NameHeader({ name, onClose }: { name: string; onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between pb-2 pl-1 pt-3">
      <Link href="/settings/profile" className="flex items-center gap-0.5">
        <span className="text-2xl font-bold leading-[1.4] text-[#1f1f1f]">
          {name || "내 정보"}
        </span>
        <Image src={`${ICON}/name-chevron.svg`} alt="" width={24} height={24} />
      </Link>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex size-11 items-center justify-center text-gray-800"
        >
          <X className="size-6" />
        </button>
      ) : null}
    </div>
  );
}

function Shortcuts({ favoritesHref }: { favoritesHref: string }) {
  const items = [
    { href: "/mission/history", icon: "calendar", label: "놀이 내역", target: "play_history" },
    { href: favoritesHref, icon: "heart", label: "관심 놀이", target: "saved_plays" },
    {
      href: "/settings/notifications",
      icon: "bell",
      label: "알림 설정",
      target: "notification_settings",
    },
  ] as const;
  return (
    <div className="flex items-center">
      {items.map((item, i) => (
        <div key={item.label} className="flex flex-1 items-center">
          {i > 0 ? <div className="h-9 w-px bg-[#eeeef0]" aria-hidden /> : null}
          <Link
            href={item.href}
            onClick={() => track({ type: "settings_shortcut_click", target: item.target })}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <Image src={`${ICON}/${item.icon}.svg`} alt="" width={32} height={32} />
            <span className="text-sm font-medium leading-[1.4] text-[#333]">
              {item.label}
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
}

/* ───────────── 시안 A: 카드형 ───────────── */

function CardGroup({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[20px] bg-white py-1.5">
      {children}
    </div>
  );
}

function CardRow({
  icon,
  title,
  value,
  muted,
  action,
}: {
  icon: string;
  title: string;
  value?: string;
  muted?: boolean;
  action: Action;
}) {
  return (
    <Pressable
      action={action}
      className="flex w-full items-center gap-3 py-3.5 pl-5 pr-4 active:bg-gray-50"
    >
      <Image src={icon} alt="" width={24} height={24} className="shrink-0" />
      <span
        className={`min-w-0 flex-1 text-base font-medium leading-[1.4] ${muted ? "text-gray-500" : "text-gray-800"}`}
      >
        {title}
      </span>
      {value ? (
        <span className="shrink-0 text-sm leading-[1.4] text-gray-400">{value}</span>
      ) : null}
      <Image src={`${ICON}/row-chevron.svg`} alt="" width={20} height={20} className="shrink-0" />
    </Pressable>
  );
}

export function MyPageCard(props: MyPageProps) {
  return (
    <div className="min-h-dvh bg-[#f4f4f6] pt-safe">
      <div className="flex flex-col gap-3 px-5 pb-10 pt-1">
        <NameHeader name={props.name} onClose={props.onClose} />
        <div className="rounded-[20px] bg-white pb-4.5 pt-5">
          <Shortcuts favoritesHref={props.favoritesHref} />
        </div>
        <CardGroup>
          <CardRow icon={`${ICON}/profile.svg`} title="내 프로필 수정" action={{ href: "/settings/profile" }} />
          <CardRow icon={`${ICON}/child.svg`} title="아이 프로필 추가/수정" action={{ href: "/settings/children" }} />
          <CardRow
            icon={`${ICON}/interest.svg`}
            title="관심사 수정"
            value={interestSummary(props.interests)}
            action={{ href: "/settings/interests" }}
          />
        </CardGroup>
        <CardGroup>
          <CardRow icon={`${ICON}/privacy.svg`} title="개인정보 보호정책" action={{ onClick: props.onOpenPrivacy }} />
          <CardRow icon={`${ICON}/terms.svg`} title="서비스 약관" action={{ onClick: props.onOpenTerms }} />
          <CardRow icon={`${ICON}/terms.svg`} title="문의하기" action={{ href: "/settings/inquiries" }} />
        </CardGroup>
        <CardGroup>
          <CardRow icon={`${ICON}/logout.svg`} title="로그아웃" muted action={{ onClick: props.onLogout }} />
          <CardRow icon={`${ICON}/withdraw.svg`} title="계정 탈퇴" muted action={{ onClick: props.onDeleteAccount }} />
        </CardGroup>
      </div>
    </div>
  );
}

/* ───────────── 시안 B: 목록형 (지금 설정 화면 + 바로가기) ───────────── */

function ListSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-bold leading-[1.4] text-gray-800">{title}</h2>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

function ListRow({
  icon: Icon,
  title,
  subtitle,
  extra,
  divider,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  extra?: ReactNode;
  divider?: boolean;
  action: Action;
}) {
  return (
    <>
      <Pressable action={action} className="block w-full">
        <div className="flex w-full items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Icon className="size-6 shrink-0 text-gray-700" />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium leading-[1.4] text-gray-800">{title}</span>
              {subtitle ? (
                <span className="text-xs leading-[1.4] text-gray-500">{subtitle}</span>
              ) : null}
            </div>
          </div>
          <ChevronRight className="size-6 shrink-0 text-gray-700" />
        </div>
      </Pressable>
      {extra}
      {divider ? <div className="h-px bg-gray-100" /> : null}
    </>
  );
}

export function MyPageList(props: MyPageProps) {
  return (
    <div className="min-h-dvh bg-white pt-safe">
      <div className="px-5 pt-1">
        <NameHeader name={props.name} onClose={props.onClose} />
      </div>
      {props.onOpenReferral ? (
        <div className="px-5 pt-4">
          <ReferralSettingsCard onClick={props.onOpenReferral} />
        </div>
      ) : null}
      <div className="pb-6 pt-4">
        <Shortcuts favoritesHref={props.favoritesHref} />
      </div>
      <div className="h-2 bg-[#f4f4f6]" aria-hidden />
      <div className="flex flex-col gap-6 px-5 pb-10 pt-6">
        <ListSection title="설정">
          <ListRow
            icon={Flag}
            title="관심사 수정"
            subtitle={`${props.interests.length}개 선택됨`}
            action={{ href: "/settings/interests" }}
            extra={
              props.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2 pl-9 pt-1">
                  {props.interests.map((id) => (
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
        </ListSection>
        <ListSection title="프로필 수정">
          <ListRow icon={User} title="내 프로필 수정" divider action={{ href: "/settings/profile" }} />
          <ListRow icon={Smile} title="아이 프로필 추가/수정" action={{ href: "/settings/children" }} />
        </ListSection>
        <ListSection title="계정 및 구독">
          <ListRow icon={UserMinus} title="계정 탈퇴" divider action={{ onClick: props.onDeleteAccount }} />
          <ListRow icon={LogOut} title="로그아웃" action={{ onClick: props.onLogout }} />
        </ListSection>
        <ListSection title="기타">
          <ListRow icon={FileText} title="개인정보 보호정책" divider action={{ onClick: props.onOpenPrivacy }} />
          <ListRow icon={ScrollText} title="서비스 약관" divider action={{ onClick: props.onOpenTerms }} />
          <ListRow
            icon={MessageCircleQuestion}
            title="문의하기"
            subtitle="궁금한 점이나 불편한 점을 알려주세요"
            action={{ href: "/settings/inquiries" }}
          />
        </ListSection>
      </div>
    </div>
  );
}
