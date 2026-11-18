"use client";

import {
  ChevronRight,
  CircleAlert,
  Info,
  Link2,
  MessageCircle,
  MessageSquareMore,
  UserPlus,
  X,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { AppHeader } from "@/components/app/app-header";
import { ClearCircleIcon } from "@/components/icons";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import type { MyReferral } from "@/lib/api/referral";
import { formatPhone, isValidPhone } from "@/lib/api/referral";
import { cn } from "@/lib/utils";

// 친구 초대(레퍼럴) 화면 모음. 데이터는 props로만 받는다 — 페이지와 미리보기가 같이 쓴다.

const COUPON_ITEM = "카페 아메리카노 T";

/* ------------------------------------------------------------------ */
/* 공통: 밑줄 입력칸 (초대 코드 / 휴대폰 번호)                           */
/* ------------------------------------------------------------------ */

function UnderlineField({
  label,
  value,
  onChange,
  placeholder,
  invalid,
  inputMode,
  maxLength,
  autoFocus,
  message,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  invalid?: boolean;
  inputMode?: "text" | "numeric" | "tel";
  maxLength?: number;
  autoFocus?: boolean;
  message?: { tone: "info" | "error"; text: ReactNode } | null;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-[13px] leading-[1.4] text-gray-500">
        {label}
        <div
          className={cn(
            "mt-1.5 flex items-center border-b-2 pb-2 transition-colors",
            invalid
              ? "border-error-500"
              : "border-gray-100 focus-within:border-primary-300",
          )}
        >
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            inputMode={inputMode}
            maxLength={maxLength}
            autoFocus={autoFocus}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-xl font-medium leading-[1.4] text-gray-800 outline-none placeholder:text-gray-300"
          />
          {value ? (
            <button
              type="button"
              aria-label={`${label} 지우기`}
              onClick={() => onChange("")}
              className="ml-2 text-gray-300"
            >
              <ClearCircleIcon size={20} />
            </button>
          ) : null}
        </div>
      </label>
      {message ? (
        <p
          className={cn(
            "mt-2 flex gap-1.5 text-[13px] leading-normal",
            message.tone === "error" ? "text-error-500" : "text-primary-300",
          )}
        >
          {message.tone === "error" ? (
            <CircleAlert className="mt-0.5 size-4 shrink-0 fill-current text-current [&>line]:stroke-white [&>circle]:stroke-current" />
          ) : (
            <Info className="mt-0.5 size-4 shrink-0 fill-current [&>path]:stroke-white [&>circle]:stroke-current" />
          )}
          <span>{message.text}</span>
        </p>
      ) : null}
    </div>
  );
}

function PageTitle({ title, sub }: { title: ReactNode; sub: ReactNode }) {
  return (
    <header className="pt-7">
      <h1 className="whitespace-pre-line text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-[1.45] text-gray-500">{sub}</p>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* 10·11 가입 - 초대 코드 입력 (온보딩 마지막, 진행바 없음)              */
/* ------------------------------------------------------------------ */

export function InviteCodeView({
  value,
  error,
  checking,
  onChange,
  onSubmit,
  onSkip,
  onBack,
}: {
  value: string;
  error: string | null;
  checking: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const canSubmit = value.length > 0 && !error && !checking;
  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
    >
      <AppHeader title="회원가입" onBack={onBack} className="-mx-5" />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <PageTitle
          title={"친구에게 받은\n초대 코드가 있나요?"}
          sub="초대 코드는 가입할 때만 입력할 수 있어요."
        />
        <div className="mt-8">
          <UnderlineField
            label="초대 코드"
            value={value}
            onChange={onChange}
            placeholder="코드 5자리"
            maxLength={10}
            invalid={Boolean(error)}
            message={
              error
                ? { tone: "error", text: error }
                : {
                    tone: "info",
                    text: "코드를 입력하면 초대한 친구에게 1명으로 인정돼요.",
                  }
            }
          />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-4 pt-3">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm font-medium leading-[1.4] text-gray-500"
        >
          초대 코드 없이 시작하기
        </button>
        <Button type="submit" size="full" disabled={!canSubmit}>
          {checking ? "확인 중…" : "확인"}
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* 03·05·06 친구 초대 이벤트 (진행 현황)                                */
/* ------------------------------------------------------------------ */

function referralHeadline(data: MyReferral) {
  const left = data.goal - data.joinedCount;
  if (data.rewardClaim) {
    return {
      title: "쿠폰 신청이\n완료됐어요",
      sub: "3일 이내 카카오톡으로 쿠폰을 보내드려요.",
    };
  }
  if (left <= 0) {
    return {
      title: `친구 ${data.goal}명이 모두 가입했어요\n커피 쿠폰을 받아보세요`,
      sub: "번호를 입력하면 3일 이내 카카오톡으로 보내드려요.",
    };
  }
  if (data.joinedCount === 0) {
    return {
      title: `친구 ${data.goal}명을 초대하면\n스타벅스 커피를 드려요`,
      sub: "초대한 친구가 육아벨에 가입하면 1명으로 인정돼요.",
    };
  }
  return {
    title: `${left}명만 더 초대하면\n커피를 받을 수 있어요`,
    sub: `지금까지 ${data.joinedCount}명이 가입했어요.`,
  };
}

/** 친구 프로필 동그라미 — Figma 캐릭터(체크 표시 포함) 이미지의 위쪽 원만 잘라 쓴다. */
function JoinedAvatar() {
  return (
    <span className="relative block size-12 overflow-hidden">
      <Image
        src="/images/referral/avatar.png"
        alt=""
        width={72}
        height={76}
        className="absolute -left-3 top-0 max-w-none"
      />
    </span>
  );
}

function FriendSlots({ data }: { data: MyReferral }) {
  const slots = Array.from({ length: data.goal }, (_, i) => data.friends[i]);
  return (
    <section className="mt-9">
      <div className="flex items-center justify-between text-sm leading-[1.4]">
        <h2 className="font-semibold text-gray-800">가입한 친구</h2>
        <span className="font-semibold text-primary-300">
          {Math.min(data.joinedCount, data.goal)} / {data.goal}명
        </span>
      </div>
      <ul className="mt-4 grid grid-cols-4 rounded-[20px] bg-gray-50 px-2 py-4">
        {slots.map((friend, i) => (
          <li key={i} className="flex flex-col items-center gap-2">
            {friend ? (
              <JoinedAvatar />
            ) : (
              <span className="grid size-12 place-items-center rounded-full border border-dashed border-gray-300 bg-white text-gray-300">
                <UserPlus className="size-5" aria-hidden />
              </span>
            )}
            <span
              className={cn(
                "max-w-full truncate px-1 text-[13px] leading-[1.4]",
                friend ? "text-gray-800" : "text-gray-400",
              )}
            >
              {friend ? friend.name : `친구 ${i + 1}`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const STEPS = [
  "내 초대 코드를 친구에게 보내요",
  "친구가 가입할 때 초대 코드를 입력해요",
  "4명이 가입하면 커피 쿠폰을 보내드려요",
];

export function ReferralView({
  data,
  onBack,
  onPrimary,
}: {
  data: MyReferral;
  onBack: () => void;
  /** 초대하기(공유 시트) 또는 쿠폰 받기 */
  onPrimary: () => void;
}) {
  const { title, sub } = referralHeadline(data);
  const reached = data.joinedCount >= data.goal;
  const primaryLabel =
    reached && !data.rewardClaim
      ? "쿠폰 받기"
      : data.joinedCount > 0
        ? "친구 더 초대하기"
        : "친구 초대하기";

  return (
    <div className="flex h-dvh flex-col bg-white">
      <AppHeader title="친구 초대 이벤트" onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
        <PageTitle title={title} sub={sub} />
        <FriendSlots data={data} />

        <section className="mt-9">
          <h2 className="text-base font-bold leading-[1.4] text-gray-800">
            이렇게 참여해요
          </h2>
          <ol className="mt-3.5 flex flex-col gap-3.5">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-2.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-50 text-xs font-semibold text-primary-300">
                  {i + 1}
                </span>
                <span className="text-sm leading-[1.4] text-gray-800">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <ul className="mt-9 flex flex-col gap-1 rounded-2xl bg-gray-50 px-4 py-4 text-xs leading-normal text-gray-500">
          <li>· 이미 육아벨에 가입한 친구는 인원에 포함되지 않아요.</li>
          <li>
            · 4명이 모이면 번호를 입력해 주세요. 3일 이내 카카오톡으로 쿠폰을
            보내드려요.
          </li>
          <li>· 쿠폰은 한 사람당 1번만 받을 수 있어요.</li>
        </ul>
      </div>
      <div className="shrink-0 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3">
        <Button size="full" onClick={onPrimary}>
          {primaryLabel}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 04 공유 방법 바텀시트                                                */
/* ------------------------------------------------------------------ */

export type ShareMethod = "kakao" | "copy" | "sms";

export function ShareSheet({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (method: ShareMethod) => void;
}) {
  const rows: Array<{ method: ShareMethod; label: string; icon: ReactNode }> = [
    {
      method: "kakao",
      label: "카카오톡으로 보내기",
      icon: (
        <span className="grid size-11 place-items-center rounded-full bg-[#FEE500]">
          <MessageCircle className="size-5 fill-[#3A1D1D] text-[#3A1D1D]" />
        </span>
      ),
    },
    {
      method: "copy",
      label: "초대 코드 복사하기",
      icon: (
        <span className="grid size-11 place-items-center rounded-full bg-gray-50">
          <Link2 className="size-5 text-gray-800" />
        </span>
      ),
    },
    {
      method: "sms",
      label: "문자로 보내기",
      icon: (
        <span className="grid size-11 place-items-center rounded-full bg-gray-50">
          <MessageSquareMore className="size-5 text-gray-800" />
        </span>
      ),
    },
  ];
  return (
    <BottomSheet
      title="어떻게 초대할까요?"
      description="친구가 가입할 때 코드를 입력하면 초대 인원에 반영돼요."
      onClose={onClose}
    >
      <ul className="flex flex-col px-6">
        {rows.map((row) => (
          <li key={row.method}>
            <button
              type="button"
              onClick={() => onSelect(row.method)}
              className="flex w-full items-center gap-3.5 py-3 text-left"
            >
              {row.icon}
              <span className="flex-1 text-base font-medium text-gray-800">
                {row.label}
              </span>
              <ChevronRight className="size-5 text-gray-300" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}

/* ------------------------------------------------------------------ */
/* 01 홈 진입 - 친구 초대 팝업 (뒤 화면 블러)                            */
/* ------------------------------------------------------------------ */

export function InvitePopup({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="invite-popup-title"
      className="fixed inset-0 z-50 mx-auto flex max-w-107.5 flex-col items-center bg-white/70 px-8 backdrop-blur-xl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[34%] h-75 w-82 -translate-x-1/2 rounded-full bg-primary-100/60 blur-[60px]"
      />
      <div className="relative flex flex-1 flex-col items-center justify-center">
        <h2
          id="invite-popup-title"
          className="text-[22px] font-bold leading-[1.4] text-gray-800"
        >
          친구 초대하고 커피 받아요
        </h2>
        <p className="mt-1.5 text-[15px] leading-[1.4] text-gray-500">
          4명 초대하면 스타벅스 커피를 드려요
        </p>
        <Image
          src="/images/referral/gift.png"
          alt=""
          width={200}
          height={195}
          priority
          // 이미지에 흰 배경이 있어 블러 배경 위에서 섞이게 한다.
          className="mt-3 mix-blend-multiply"
        />
        <Button
          size="full"
          onClick={onConfirm}
          className="mt-1 h-13 w-80.5 rounded-full"
        >
          친구 초대하러 가기
        </Button>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="relative mb-[max(40px,env(safe-area-inset-bottom))] flex items-center gap-1 text-base font-medium text-gray-800"
      >
        닫기 <X className="size-5" aria-hidden />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 02 마이페이지 - 친구 초대하기 카드                                    */
/* ------------------------------------------------------------------ */

export function ReferralSettingsCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex w-full items-center overflow-hidden rounded-[20px] bg-linear-to-br from-[#F1EEFF] to-[#F8F6FF] px-5 py-5 text-left"
    >
      <div className="relative z-10 flex flex-col items-start">
        <p className="text-lg font-bold leading-[1.4] text-gray-800">
          친구 4명 초대하고
          <br />
          스타벅스 커피 받기
        </p>
        <span className="mt-3 inline-flex h-7 items-center gap-0.5 rounded-full bg-primary-300 pl-3 pr-2 text-xs font-semibold text-white">
          초대하러 가기
          <ChevronRight className="size-3.5" aria-hidden />
        </span>
      </div>
      <Image
        src="/images/referral/gift.png"
        alt=""
        width={110}
        height={107}
        className="absolute -right-1 top-1/2 -translate-y-1/2 mix-blend-multiply"
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* 07 4명 달성 - 쿠폰 도착 모달                                          */
/* ------------------------------------------------------------------ */

// 쿠폰 도착 축하 — 모달 위쪽 가운데에서 한 번 터지고 떨어지는 색종이 (반복하지 않음).
const CONFETTI_COLORS = [
  "#9572FF",
  "#FFD43B",
  "#69DB7C",
  "#FF8787",
  "#74C0FC",
  "#B69CFE",
];
const CONFETTI = Array.from({ length: 36 }, (_, i) => {
  // 고정된 의사 난수 — 렌더마다 모양이 바뀌지 않게 한다.
  const rand = (n: number) =>
    (((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1) + 1) % 1;
  const angle = (i / 36) * Math.PI * 2 + rand(1) * 0.4;
  const distance = 90 + rand(2) * 110;
  return {
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    dx: Math.cos(angle) * distance,
    dy: Math.sin(angle) * distance * 0.8 - 60,
    rotate: (rand(3) - 0.5) * 720,
    delay: rand(4) * 0.15,
    round: i % 4 === 0,
    w: 6 + rand(5) * 4,
    h: i % 4 === 0 ? 7 : 10 + rand(6) * 6,
  };
});

function ConfettiBurst() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[30%] z-10 size-0"
    >
      {CONFETTI.map((piece, i) => (
        <span
          key={i}
          className="confetti-burst absolute left-0 top-0"
          style={
            {
              width: piece.w,
              height: piece.round ? piece.w : piece.h,
              background: piece.color,
              borderRadius: piece.round ? 999 : 2,
              animationDelay: `${piece.delay}s`,
              "--dx": `${piece.dx}px`,
              "--dy": `${piece.dy}px`,
              "--rot": `${piece.rotate}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function CouponArrivedModal({
  goal,
  onClaim,
  onClose,
}: {
  goal: number;
  onClaim: () => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="coupon-modal-title"
      className="fixed inset-0 z-50 mx-auto flex max-w-107.5 items-center justify-center overflow-hidden bg-black/50 px-10"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-77.5 rounded-3xl bg-white px-5 pb-5 pt-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="coupon-modal-title"
          className="text-xl font-bold leading-[1.4] text-gray-800"
        >
          커피 쿠폰이 도착했어요
        </h2>
        <Image
          src="/images/referral/coffee.png"
          alt="스타벅스 카페 아메리카노"
          width={104}
          height={104}
          className="mx-auto mt-6 rounded-[20px]"
        />
        <p className="mt-5 text-base leading-normal text-gray-800">
          친구 {goal}명이 모두 가입했어요
          <br />
          <strong className="font-bold">[스타벅스] {COUPON_ITEM}</strong>
          <br />
          쿠폰을 받아보세요!
        </p>
        <Button size="full" onClick={onClaim} className="mt-8 h-13 rounded-2xl">
          쿠폰 받기
        </Button>
      </div>
      {/* 색종이는 모달 카드 위에 보이게 맨 뒤에 그린다 (클릭은 통과). */}
      <ConfettiBurst />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 08 쿠폰 받기 - 휴대폰 번호 입력                                       */
/* ------------------------------------------------------------------ */

export function CouponClaimView({
  phone,
  error,
  submitting,
  onPhoneChange,
  onSubmit,
  onBack,
}: {
  phone: string;
  error: string | null;
  submitting: boolean;
  onPhoneChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  // 개인정보 수집·이용은 회원가입 때 필수로 받으므로 여기서 다시 받지 않는다.
  const canSubmit = isValidPhone(phone) && !submitting;
  return (
    <div className="flex h-dvh flex-col bg-white">
      <AppHeader title="쿠폰 받기" onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6">
        <PageTitle
          title={"쿠폰 받을\n휴대폰 번호를 알려주세요"}
          sub="입력한 번호의 카카오톡으로 쿠폰을 보내드려요."
        />
        <div className="mt-8">
          <UnderlineField
            label="휴대폰 번호"
            value={formatPhone(phone)}
            onChange={(v) => onPhoneChange(v.replace(/\D/g, "").slice(0, 11))}
            placeholder="010-0000-0000"
            inputMode="tel"
            invalid={Boolean(error)}
            message={
              error
                ? { tone: "error", text: error }
                : {
                    tone: "info",
                    text: (
                      <>
                        쿠폰은 3일 이내 카카오톡으로 보내드려요.
                        <br />
                        번호를 잘못 입력하면 다시 보내드리기 어려워요.
                      </>
                    ),
                  }
            }
          />
        </div>
      </div>
      <div className="shrink-0 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3">
        <Button size="full" disabled={!canSubmit} onClick={onSubmit}>
          {submitting ? "신청 중…" : "쿠폰 받기"}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 09 쿠폰 신청 완료                                                     */
/* ------------------------------------------------------------------ */

export function CouponDoneView({
  phone,
  onConfirm,
}: {
  phone: string;
  onConfirm: () => void;
}) {
  return (
    <div className="flex h-dvh flex-col bg-white pt-safe">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-26 text-center">
        <Image
          src="/images/referral/coffee.png"
          alt=""
          width={104}
          height={104}
          className="mx-auto rounded-[20px]"
        />
        <h1 className="mt-8 text-xl font-bold leading-[1.4] text-gray-800">
          쿠폰 신청이 완료됐어요
        </h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-gray-500">
          3일 이내 카카오톡으로
          <br />
          쿠폰을 보내드릴게요
        </p>
        <dl className="mt-8 flex flex-col gap-3.5 rounded-2xl bg-gray-50 px-5 py-5 text-sm leading-[1.4]">
          {[
            ["상품", COUPON_ITEM],
            ["받는 번호", formatPhone(phone)],
            ["발송", "3일 이내 카카오톡"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-gray-500">{k}</dt>
              <dd className="font-medium text-gray-800">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="shrink-0 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3">
        <Button size="full" onClick={onConfirm}>
          확인
        </Button>
      </div>
    </div>
  );
}
