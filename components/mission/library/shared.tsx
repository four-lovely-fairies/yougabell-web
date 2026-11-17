"use client";

import type { LibraryOrder, LibraryPlayItem, PlayCategoryId } from "@/lib/api";
import { useEdgeSwipeBack } from "@/hooks/use-edge-swipe-back";
import { ArrowLeft, Check, ChevronDown, ChevronRight, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

// 관심 놀이 목록 · 놀이 내역이 함께 쓰는 화면 조각 (Figma 04 관심 놀이 목록 기준).

export const PLAY_CATEGORIES: Array<{ id: PlayCategoryId | null; label: string }> = [
  { id: null, label: "전체" },
  { id: "social", label: "사회성" },
  { id: "language", label: "언어발달" },
  { id: "cognitive", label: "인지발달" },
  { id: "physical", label: "신체발달" },
];

// 카드 왼쪽 썸네일 — 발달 영역별 아이콘과 배경.
const CATEGORY_THUMB: Record<string, { icon: string; bg: string }> = {
  language: { icon: "/icons/figma/play-category/language.svg", bg: "bg-[#eaf3ff]" },
  social: { icon: "/icons/figma/play-category/social.svg", bg: "bg-[#f1ebff]" },
  cognitive: { icon: "/icons/figma/play-category/cognitive.svg", bg: "bg-[#e6f8ef]" },
  physical: { icon: "/icons/figma/play-category/physical.svg", bg: "bg-[#fff1e6]" },
};

export function CategoryThumb({ categoryId }: { categoryId: string }) {
  const thumb = CATEGORY_THUMB[categoryId] ?? CATEGORY_THUMB.language;
  return (
    <div className={`flex size-11 shrink-0 items-center justify-center rounded-[14px] ${thumb.bg}`}>
      <Image src={thumb.icon} alt="" width={28} height={28} />
    </div>
  );
}

export function HeartButton({
  on,
  onToggle,
  disabled,
}: {
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      disabled={disabled}
      aria-pressed={on}
      aria-label={on ? "관심 놀이에서 빼기" : "관심 놀이에 저장"}
      className="-m-2.5 flex size-11 shrink-0 items-center justify-center transition-transform active:scale-90"
    >
      <Image
        src={on ? "/icons/figma/mission/heart-on.svg" : "/icons/figma/mission/heart-off.svg"}
        alt=""
        width={24}
        height={24}
      />
    </button>
  );
}

export function PlayCard({
  item,
  caption,
  onOpen,
  onToggleFavorite,
  busy,
}: {
  item: LibraryPlayItem;
  caption: string;
  onOpen: () => void;
  onToggleFavorite: () => void;
  busy?: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen();
      }}
      className="flex w-full items-center gap-3.5 rounded-[20px] bg-white p-4 text-left transition-colors active:bg-gray-50"
    >
      <CategoryThumb categoryId={item.categoryId} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.4]">
        <p className="text-xs font-bold text-primary-400">
          {item.categoryLabel} · {item.durationLabel}
        </p>
        <p className="truncate text-base font-bold text-gray-800">{item.title}</p>
        <p className="truncate text-xs text-gray-500">{caption}</p>
      </div>
      <HeartButton on={item.isFavorite} onToggle={onToggleFavorite} disabled={busy} />
    </div>
  );
}

export function CategoryChips({
  value,
  onChange,
}: {
  value: PlayCategoryId | null;
  onChange: (id: PlayCategoryId | null) => void;
}) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
      {PLAY_CATEGORIES.map((category) => {
        const selected = category.id === value;
        return (
          <button
            key={category.label}
            type="button"
            onClick={() => onChange(category.id)}
            aria-pressed={selected}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium leading-[1.4] transition-colors ${
              selected
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}

const ORDER_LABEL: Record<LibraryOrder, string> = { latest: "최신순", oldest: "오래된순" };

// 개수 + 정렬(최신순/오래된순). 누르면 작은 메뉴가 열린다.
export function CountAndSort({
  countLabel,
  countBold = false,
  order,
  onOrderChange,
}: {
  countLabel: string;
  /** 개수를 굵게 (놀이 내역) */
  countBold?: boolean;
  order: LibraryOrder;
  onOrderChange: (order: LibraryOrder) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex items-center justify-between pb-1 pl-1">
      <p
        className={`text-sm leading-[1.4] ${countBold ? "font-bold text-gray-800" : "font-medium text-gray-500"}`}
      >
        {countLabel}
      </p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="-mr-1 flex items-center gap-0.5 rounded-full px-1 py-0.5 text-sm font-medium leading-[1.4] text-gray-600"
      >
        {ORDER_LABEL[order]}
        <ChevronDown className="size-4" aria-hidden />
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="정렬 닫기"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 top-full z-30 mt-1 flex w-32 animate-dissolve flex-col overflow-hidden rounded-2xl bg-white py-1 shadow-3 motion-reduce:animate-none"
            style={{ animationDuration: "150ms" }}
          >
            {(Object.keys(ORDER_LABEL) as LibraryOrder[]).map((key) => (
              <button
                key={key}
                type="button"
                role="menuitemradio"
                aria-checked={order === key}
                onClick={() => {
                  onOrderChange(key);
                  setOpen(false);
                }}
                className="flex items-center justify-between px-4 py-2.5 text-sm font-medium leading-[1.4] text-gray-800 active:bg-gray-50"
              >
                {ORDER_LABEL[key]}
                {order === key ? <Check className="size-4 text-primary-300" aria-hidden /> : null}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

// 상단 헤더 — 뒤로가기 · 제목 · 검색. 검색을 누르면 헤더가 검색창으로 바뀐다.
export function LibraryHeader({
  title,
  onBack,
  query,
  onQueryChange,
  searchPlaceholder,
  showSearch = true,
}: {
  title: string;
  onBack: () => void;
  query: string;
  onQueryChange: (q: string) => void;
  searchPlaceholder: string;
  /** 목록이 아예 비었을 때는 검색 버튼을 숨긴다 (Figma 04 관심 놀이 목록 - 없음). */
  showSearch?: boolean;
}) {
  useEdgeSwipeBack(onBack);
  const [searching, setSearching] = useState(query.length > 0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searching) inputRef.current?.focus();
  }, [searching]);

  return (
    <header className="fixed inset-x-0 top-0 z-30 mx-auto w-full max-w-107.5 bg-[#f4f4f6] px-4 pt-safe">
      <div className="flex h-14 items-center gap-1">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="flex size-11 shrink-0 items-center justify-center text-gray-800"
        >
          <ArrowLeft className="size-6" aria-hidden />
        </button>
        {searching ? (
          <div className="flex h-10 min-w-0 flex-1 animate-dissolve items-center gap-2 rounded-xl bg-white px-3 motion-reduce:animate-none" style={{ animationDuration: "150ms" }}>
            <Search className="size-4.5 shrink-0 text-gray-400" aria-hidden />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={searchPlaceholder}
              enterKeyHint="search"
              aria-label={searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-[16px] leading-[1.4] text-gray-800 outline-none placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                aria-label="검색어 지우기"
                className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-300 text-white"
              >
                <X className="size-3" aria-hidden />
              </button>
            ) : null}
          </div>
        ) : (
          <h1 className="min-w-0 flex-1 text-center text-base font-bold leading-[1.4] text-gray-800">
            {title}
          </h1>
        )}
        {searching ? (
          <button
            type="button"
            onClick={() => {
              onQueryChange("");
              setSearching(false);
            }}
            className="shrink-0 px-2 text-sm font-medium text-gray-600"
          >
            취소
          </button>
        ) : showSearch ? (
          <button
            type="button"
            onClick={() => setSearching(true)}
            aria-label="검색"
            className="flex size-11 shrink-0 items-center justify-center text-gray-800"
          >
            <Search className="size-6" aria-hidden />
          </button>
        ) : (
          <div className="size-11 shrink-0" aria-hidden />
        )}
      </div>
    </header>
  );
}

export function LibraryHeaderSpacer() {
  return (
    <div aria-hidden className="pt-safe">
      <div className="h-14" />
    </div>
  );
}

// Figma 04 관심 놀이 목록 - 없음 — 문서 아이콘 · 제목 18 · 안내 14.
export function LibraryEmpty({
  title,
  body,
  fill = false,
  action,
}: {
  title: string;
  body?: string;
  /** 작은 CTA — 마이페이지 "초대하러 가기"와 같은 보라 알약 버튼 */
  action?: { label: string; href: string };
  /** 남는 높이 전체를 채워 화면 가운데에 놓는다. */
  fill?: boolean;
}) {
  return (
    <div
      className={`flex animate-dissolve flex-col items-center justify-center text-center leading-[1.4] motion-reduce:animate-none ${
        fill ? "min-h-0 flex-1 pb-12" : "py-20"
      }`}
      style={{ animationDuration: "300ms" }}
    >
      <Image src="/icons/figma/play-category/empty-document.svg" alt="" width={42} height={51} />
      <p className="mt-5 text-lg font-bold text-gray-800">{title}</p>
      {body ? (
        <p className="mt-1.5 whitespace-pre-line text-sm text-gray-500">{body}</p>
      ) : null}
      {action ? (
        <Link
          href={action.href}
          className="mt-6 flex items-center gap-0.5 rounded-full bg-primary-300 py-1.5 pl-3 pr-2 text-xs font-bold leading-[1.4] text-white transition-transform active:scale-95"
        >
          {action.label}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

export function LibraryCardSkeleton() {
  return <div className="skeleton h-19 w-full rounded-[20px]" aria-hidden />;
}

// Figma 02 — 하단 토스트 "관심 놀이에 저장했어요" + 바로가기.
export function FavoriteSavedToast({
  onClose,
  bottomOffset = 96,
}: {
  onClose: () => void;
  bottomOffset?: number;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 2000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="status"
      className="fixed inset-x-0 z-40 mx-auto flex w-[calc(100%-32px)] max-w-89.5 animate-dissolve items-center gap-3 rounded-2xl bg-[rgba(47,52,59,0.94)] py-4.5 pl-5 pr-3.5 backdrop-blur-[5px] motion-reduce:animate-none"
      style={{
        bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom))`,
        animationDuration: "200ms",
      }}
    >
      <p className="min-w-0 flex-1 text-sm font-medium leading-[1.4] text-white">
        관심 놀이에 저장했어요. 관심놀이는 마이페이지에서 확인할 수 있어요.
      </p>
      <ToastLink href="/mission/saved">바로가기</ToastLink>
    </div>
  );
}

function ToastLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="shrink-0 rounded-full bg-white/16 px-3.5 py-2 text-sm font-medium leading-[1.4] text-white"
    >
      {children}
    </Link>
  );
}

// 검색어 입력을 조금 기다렸다가 반영한다 (타이핑마다 요청하지 않게).
export function useDebounced<T>(value: T, ms = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}
