"use client";

import {
  listPlayHistoryForMonth,
  rememberSelectedPlay,
  setPlayFavorite,
  type LibraryOrder,
  type PlayCategoryId,
  type PlayHistoryItem,
} from "@/lib/api";
import { Check, ChevronDown, Search, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CategoryChips,
  CountAndSort,
  FavoriteSavedToast,
  LibraryCardSkeleton,
  LibraryEmpty,
  LibraryHeader,
  LibraryHeaderSpacer,
  PlayCard,
  useDebounced,
} from "./shared";

// 놀이 내역 (Figma 03 놀이 내역 - 달력 / 목록 / 없음).
// 월을 고르고 달력 또는 목록으로 본다. 목록에서는 발달 영역 필터·정렬·제목 검색.

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

type ViewMode = "calendar" | "list";
type Month = { year: number; month: number };

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const sameMonth = (a: Month, b: Month) => a.year === b.year && a.month === b.month;

const monthLabel = ({ year, month }: Month) => `${year}.${String(month).padStart(2, "0")}`;

// "오늘 · 11월 17일 (화)", "어제 · 11월 16일 (월)", "11월 14일 (토)"
const dayLabel = (iso: string, now = new Date()) => {
  const date = new Date(iso);
  const base = `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dayKey(date) === dayKey(now)) return `오늘 · ${base}`;
  if (dayKey(date) === dayKey(yesterday)) return `어제 · ${base}`;
  return base;
};

// "오전 10:05에 했어요"
const timeCaption = (iso: string) => {
  const date = new Date(iso);
  const hours = date.getHours();
  const period = hours < 12 ? "오전" : "오후";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${period} ${hour12}:${String(date.getMinutes()).padStart(2, "0")}에 했어요`;
};

const groupByDay = (items: PlayHistoryItem[]) => {
  const groups: Array<{ label: string; items: PlayHistoryItem[] }> = [];
  for (const item of items) {
    const label = dayLabel(item.completedAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
};

export function PlayHistoryScreen() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const thisMonth: Month = { year: today.getFullYear(), month: today.getMonth() + 1 };
  const [month, setMonth] = useState<Month>(thisMonth);
  const [view, setView] = useState<ViewMode>("calendar");
  const [category, setCategory] = useState<PlayCategoryId | null>(null);
  const [order, setOrder] = useState<LibraryOrder>("latest");
  const [query, setQuery] = useState("");
  const q = useDebounced(query);
  const [items, setItems] = useState<PlayHistoryItem[] | null>(null);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [monthSheetOpen, setMonthSheetOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());

  // 달력은 그 달 전체, 목록은 필터·검색을 반영한다.
  const listFilters = view === "list";
  useEffect(() => {
    let cancelled = false;
    listPlayHistoryForMonth({
      ...month,
      q: listFilters ? q : "",
      categoryId: listFilters ? category : null,
      order: listFilters ? order : "latest",
    })
      .then((result) => {
        if (cancelled) return;
        setError(false);
        setItems(result.items);
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [month, listFilters, q, category, order]);

  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else router.push("/settings");
  };

  const selectMonth = (next: Month) => {
    setMonthSheetOpen(false);
    if (sameMonth(next, month)) return;
    setItems(null);
    setMonth(next);
    // 이번 달이면 오늘, 지난달이면 1일을 기본으로 고른다.
    setSelectedDay(sameMonth(next, thisMonth) ? today.getDate() : 1);
  };

  // 같은 놀이를 여러 번 했으면 모든 줄의 하트를 함께 바꾼다.
  const setFavoriteLocal = (missionId: string, on: boolean) =>
    setItems((list) =>
      list?.map((i) => (i.missionId === missionId ? { ...i, isFavorite: on } : i)) ?? null,
    );

  const toggle = async (item: PlayHistoryItem) => {
    const next = !item.isFavorite;
    setBusyId(item.executionId);
    setFavoriteLocal(item.missionId, next);
    try {
      await setPlayFavorite(item.missionId, next);
      if (next) setToastOpen(true);
    } catch {
      setFavoriteLocal(item.missionId, !next);
    } finally {
      setBusyId(null);
    }
  };

  const open = (item: PlayHistoryItem) => {
    rememberSelectedPlay(item);
    router.push(`/mission/saved/play?missionId=${item.missionId}`);
  };

  const card = (item: PlayHistoryItem) => (
    <PlayCard
      key={item.executionId}
      item={item}
      caption={timeCaption(item.completedAt)}
      onOpen={() => open(item)}
      onToggleFavorite={() => void toggle(item)}
      busy={busyId === item.executionId}
    />
  );

  const searching = q.trim().length > 0;
  // 목록에서 필터·검색 없이 그 달 기록이 하나도 없으면 안내만 보여 준다 (Figma 03 놀이 내역 - 없음).
  const listEmpty =
    view === "list" && items !== null && !error && items.length === 0 && !searching && !category;

  return (
    <div className="flex min-h-dvh flex-col bg-[#f4f4f6]">
      <LibraryHeader
        title="놀이 내역"
        onBack={goBack}
        query=""
        onQueryChange={() => {}}
        searchPlaceholder=""
        showSearch={false}
      />
      <LibraryHeaderSpacer />

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 pb-10">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMonthSheetOpen(true)}
            aria-haspopup="dialog"
            className="flex items-center text-xl font-bold leading-[1.4] tracking-[-0.4px] text-gray-800"
          >
            {monthLabel(month)}
            <ChevronDown className="size-6" aria-hidden />
          </button>
          <ViewToggle value={view} onChange={setView} />
        </div>

        {view === "calendar" ? (
          <CalendarView
            month={month}
            today={today}
            items={items}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            renderCard={card}
          />
        ) : listEmpty ? (
          <LibraryEmpty
            fill
            title="아직 기록된 놀이가 없어요"
            body={"아이와 놀이를 하면\n날짜별로 여기에 기록돼요"}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <SearchField value={query} onChange={setQuery} />
            <CategoryChips value={category} onChange={setCategory} />
            <CountAndSort
              countLabel={`${items?.length ?? 0}개`}
              countBold
              order={order}
              onOrderChange={setOrder}
            />
            {items === null ? (
              <>
                <LibraryCardSkeleton />
                <LibraryCardSkeleton />
                <LibraryCardSkeleton />
              </>
            ) : error ? (
              <LibraryEmpty title="놀이 내역을 불러오지 못했어요" body="잠시 후 다시 시도해 주세요." />
            ) : items.length === 0 ? (
              <LibraryEmpty title="찾는 놀이가 없어요" body={"다른 검색어나 영역을\n골라 보세요"} />
            ) : (
              groupByDay(items).map((group) => (
                <section
                  key={group.label}
                  className="flex animate-dissolve flex-col gap-3 motion-reduce:animate-none"
                  style={{ animationDuration: "300ms" }}
                >
                  <h2 className="pl-1 pt-2 text-sm font-medium leading-[1.4] text-gray-500">
                    {group.label}
                  </h2>
                  {group.items.map(card)}
                </section>
              ))
            )}
          </div>
        )}
      </div>

      {monthSheetOpen ? (
        <MonthSheet
          current={month}
          latest={thisMonth}
          onSelect={selectMonth}
          onClose={() => setMonthSheetOpen(false)}
        />
      ) : null}
      {toastOpen ? (
        <FavoriteSavedToast onClose={() => setToastOpen(false)} bottomOffset={24} />
      ) : null}
    </div>
  );
}

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  const options: Array<[ViewMode, string]> = [
    ["calendar", "달력"],
    ["list", "목록"],
  ];
  return (
    <div role="tablist" className="flex h-10 items-center gap-1 rounded-full bg-white p-0.5">
      {options.map(([key, label]) => {
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(key)}
            className={`flex h-full items-center rounded-full px-3.5 text-sm font-medium leading-[1.4] transition-colors ${
              selected ? "bg-gray-900 text-gray-20" : "text-gray-500"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function SearchField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex h-12 items-center gap-2 rounded-2xl bg-white px-4">
      <Search className="size-5 shrink-0 text-gray-400" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="놀이 이름으로 검색"
        enterKeyHint="search"
        aria-label="놀이 이름으로 검색"
        className="min-w-0 flex-1 bg-transparent text-[16px] leading-[1.4] text-gray-800 outline-none placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="검색어 지우기"
          className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-300 text-white"
        >
          <X className="size-3" aria-hidden />
        </button>
      ) : null}
    </label>
  );
}

function CalendarView({
  month,
  today,
  items,
  selectedDay,
  onSelectDay,
  renderCard,
}: {
  month: Month;
  today: Date;
  items: PlayHistoryItem[] | null;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  renderCard: (item: PlayHistoryItem) => React.ReactNode;
}) {
  const daysInMonth = new Date(month.year, month.month, 0).getDate();
  const firstWeekday = new Date(month.year, month.month - 1, 1).getDay();
  const isThisMonth =
    today.getFullYear() === month.year && today.getMonth() + 1 === month.month;

  const byDay = new Map<number, PlayHistoryItem[]>();
  for (const item of items ?? []) {
    const day = new Date(item.completedAt).getDate();
    byDay.set(day, [...(byDay.get(day) ?? []), item]);
  }

  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  const selectedDate = new Date(month.year, month.month - 1, selectedDay);
  const selectedPlays = byDay.get(selectedDay) ?? [];

  return (
    <div className="flex flex-col gap-5.5">
      <div className="flex flex-col gap-4 rounded-[20px] bg-white py-6">
        <div className="flex justify-between px-5 text-center text-xs font-medium leading-[1.4] text-gray-300">
          {WEEKDAYS.map((label) => (
            <span key={label} className="w-8.75">
              {label}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {weeks.map((week, index) => (
            <div key={index} className="flex justify-between px-4">
              {week.map((day, cellIndex) => {
                if (day === null) return <span key={`e${cellIndex}`} className="w-8.75" aria-hidden />;
                const done = byDay.has(day);
                const selected = day === selectedDay;
                const isFuture =
                  isThisMonth ? day > today.getDate() : new Date(month.year, month.month - 1, day) > today;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => onSelectDay(day)}
                    disabled={isFuture}
                    aria-pressed={selected}
                    aria-label={`${month.month}월 ${day}일${done ? ", 놀이 함" : ""}`}
                    className="flex w-8.75 flex-col items-center gap-1.5 disabled:cursor-default"
                  >
                    <span
                      className={`flex h-4.5 w-7 items-center justify-center rounded-full text-xs font-medium leading-[1.4] transition-colors ${
                        selected ? "bg-gray-900 text-white" : "text-gray-400"
                      }`}
                    >
                      {day}
                    </span>
                    {done ? (
                      <Image
                        src="/icons/figma/play-history/day-done.svg"
                        alt=""
                        width={35}
                        height={35}
                        className="size-8.75 animate-dissolve motion-reduce:animate-none"
                        style={{ animationDuration: "250ms" }}
                      />
                    ) : (
                      <span className="size-8.75 rounded-full bg-gray-100" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="pl-1 text-sm font-bold leading-[1.4] text-gray-800">
          {selectedDate.getMonth() + 1}.{selectedDate.getDate()} {WEEKDAYS[selectedDate.getDay()]}요일
        </h2>
        {items === null ? (
          <LibraryCardSkeleton />
        ) : selectedPlays.length > 0 ? (
          <div className="flex flex-col gap-3">{selectedPlays.map(renderCard)}</div>
        ) : (
          <div className="flex h-23 flex-col items-center justify-center gap-2.25 rounded-[20px] bg-white">
            <Image src="/icons/figma/play-history/no-play.svg" alt="" width={28} height={28} />
            <p className="text-sm font-medium leading-[1.4] text-[#9fa2a9]">기록된 놀이가 없어요</p>
          </div>
        )}
      </section>
    </div>
  );
}

// 월 선택 — 이번 달부터 1년 전까지.
function MonthSheet({
  current,
  latest,
  onSelect,
  onClose,
}: {
  current: Month;
  latest: Month;
  onSelect: (month: Month) => void;
  onClose: () => void;
}) {
  const months: Month[] = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(latest.year, latest.month - 1 - i, 1);
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
  });
  return (
    <div
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-107.5 flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="월 선택"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 animate-dissolve cursor-default bg-black/50 motion-reduce:animate-none"
        style={{ animationDuration: "200ms" }}
      />
      <div className="relative flex max-h-[70dvh] animate-sheet-up flex-col rounded-t-[24px] bg-white pb-[max(24px,env(safe-area-inset-bottom))] pt-3 motion-reduce:animate-none">
        <div className="mx-auto h-1 w-10 rounded-[2px] bg-[#e0e0e0]" aria-hidden />
        <h2 className="px-6 pb-2 pt-5 text-lg font-bold leading-[1.4] text-gray-800">월 선택</h2>
        {/* 6개월 정도만 보이고 나머지는 스크롤 (한 줄 50px) */}
        <div className="max-h-75 overflow-y-auto overscroll-contain">
          {months.map((m) => {
            const selected = sameMonth(m, current);
            return (
              <button
                key={monthLabel(m)}
                type="button"
                onClick={() => onSelect(m)}
                className="flex w-full items-center justify-between px-6 py-3.5 text-base font-medium leading-[1.4] text-gray-800 active:bg-gray-50"
              >
                {m.year}년 {m.month}월
                {selected ? <Check className="size-5 text-primary-300" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
