"use client";

import {
  listFavoritePlays,
  rememberSelectedPlay,
  setPlayFavorite,
  type FavoritePlayItem,
  type LibraryOrder,
  type PlayCategoryId,
} from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CategoryChips,
  CountAndSort,
  LibraryCardSkeleton,
  LibraryEmpty,
  LibraryHeader,
  LibraryHeaderSpacer,
  PlayCard,
  useDebounced,
} from "./shared";

// Figma 04 관심 놀이 목록 — 발달 영역 필터 · 최신순/오래된순 · 제목 검색.
export function SavedPlaysScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<PlayCategoryId | null>(null);
  const [order, setOrder] = useState<LibraryOrder>("latest");
  const [query, setQuery] = useState("");
  const q = useDebounced(query);
  const [items, setItems] = useState<FavoritePlayItem[] | null>(null);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listFavoritePlays({ order, q, categoryId: category })
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
  }, [order, q, category]);

  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else router.push("/settings");
  };

  // 하트를 끄면 바로 목록에서 빼고, 실패하면 되돌린다.
  const toggle = async (item: FavoritePlayItem) => {
    setBusyId(item.missionId);
    const before = items;
    setItems((list) => list?.filter((i) => i.missionId !== item.missionId) ?? null);
    try {
      await setPlayFavorite(item.missionId, false);
    } catch {
      setItems(before);
    } finally {
      setBusyId(null);
    }
  };

  const open = (item: FavoritePlayItem) => {
    rememberSelectedPlay(item);
    router.push(`/mission/saved/play?missionId=${item.missionId}`);
  };

  const searching = q.trim().length > 0;
  // 필터·검색 없이도 하나도 없으면 칩·정렬·검색 없이 안내만 보여 준다.
  const nothingSaved =
    items !== null && !error && items.length === 0 && !searching && !category;

  if (nothingSaved) {
    return (
      <div className="flex h-dvh flex-col bg-[#f4f4f6]">
        <LibraryHeader
          title="관심 놀이"
          onBack={goBack}
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder="관심 놀이 검색"
          showSearch={false}
        />
        <LibraryHeaderSpacer />
        <LibraryEmpty
          fill
          title="아직 저장한 놀이가 없어요"
          body={"마음에 드는 놀이에 하트를 누르면\n여기에 모아 볼 수 있어요"}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#f4f4f6]">
      <LibraryHeader
        title="관심 놀이"
        onBack={goBack}
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="관심 놀이 검색"
      />
      <LibraryHeaderSpacer />
      <div className="flex flex-col gap-3 px-5 pb-10 pt-2">
        <CategoryChips value={category} onChange={setCategory} />
        <CountAndSort
          countLabel={`저장한 놀이 ${items?.length ?? 0}개`}
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
          <LibraryEmpty title="관심 놀이를 불러오지 못했어요" body="잠시 후 다시 시도해 주세요." />
        ) : items.length === 0 ? (
          <LibraryEmpty title="찾는 놀이가 없어요" body={"다른 검색어나 영역을\n골라 보세요"} />
        ) : (
          items.map((item) => (
            <div key={item.missionId} className="animate-dissolve motion-reduce:animate-none" style={{ animationDuration: "300ms" }}>
              <PlayCard
                item={item}
                caption={item.shortTitle || item.description}
                onOpen={() => open(item)}
                onToggleFavorite={() => void toggle(item)}
                busy={busyId === item.missionId}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
