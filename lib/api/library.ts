import { authHeaders, request } from "./client";

// 관심 놀이 · 놀이 내역 — yougabell-api /missions/favorites, /mission-executions/history.
// 로그인 세션이 없으면(미리보기·데모) 브라우저에만 저장하는 샘플 데이터로 동작한다.

export type PlayCategoryId = "social" | "language" | "cognitive" | "physical";

export type LibraryOrder = "latest" | "oldest";

export type LibraryQuery = {
  order?: LibraryOrder;
  q?: string;
  categoryId?: PlayCategoryId | null;
};

export type LibraryPlayItem = {
  missionId: string;
  title: string;
  shortTitle: string;
  description: string;
  durationMinutes: number;
  durationLabel: string;
  categoryId: string;
  categoryLabel: string;
  // 놀이 출처 — API 배포 전 응답에는 없을 수 있다
  sourceLabel?: string;
  // 놀이 목표 (예: #순서기다리기 #충동조절) — API 배포 전 응답에는 없을 수 있다
  goalLabel?: string | null;
  isFavorite: boolean;
};

export type FavoritePlayItem = LibraryPlayItem & { savedAt: string };

export type PlayHistoryItem = LibraryPlayItem & {
  executionId: string;
  childId: string;
  status: "completed" | "early_completed";
  completedAt: string;
  actualDurationSeconds: number | null;
  hasFeedback: boolean;
};

export type LibraryList<T> = { items: T[]; total: number; source: "api" | "demo" };

const toQueryString = (query: LibraryQuery, extra?: Record<string, string>) => {
  const params = new URLSearchParams();
  if (query.order) params.set("order", query.order);
  const q = query.q?.trim();
  if (q) params.set("q", q);
  if (query.categoryId) params.set("categoryId", query.categoryId);
  for (const [key, value] of Object.entries(extra ?? {})) params.set(key, value);
  const text = params.toString();
  return text ? `?${text}` : "";
};

/* ───────────── 데모 (비로그인 미리보기) ───────────── */

const DEMO_FAVORITES_KEY = "library:demo-favorites";

const DEMO_PLAYS: LibraryPlayItem[] = [
  {
    missionId: "demo-mission",
    title: "짝짜꿍 노래 게임",
    shortTitle: "손뼉을 마주치며 노래를 3번 반복해요",
    description:
      '아이와 마주 앉아 "짝짜꿍" 노래를 부르며 손뼉을 마주치는 게임을 3회 반복한다. 아이가 먼저 손을 내밀면 반응을 크게 해준다.',
    durationMinutes: 10,
    durationLabel: "10분",
    categoryId: "language",
    categoryLabel: "언어발달",
    sourceLabel: "CDC 2022",
    isFavorite: false,
  },
  {
    missionId: "demo-peekaboo",
    title: "까꿍 숨바꼭질",
    shortTitle: "이불 뒤에 숨었다가 까꿍! 하고 나타나요",
    description: "이불이나 손으로 얼굴을 가렸다가 \"까꿍!\" 하고 나타난다.",
    durationMinutes: 10,
    durationLabel: "10분",
    categoryId: "social",
    categoryLabel: "사회성",
    sourceLabel: "AAP 2021",
    isFavorite: false,
  },
  {
    missionId: "demo-cups",
    title: "종이컵 탑 쌓기",
    shortTitle: "종이컵을 번갈아 쌓고 무너뜨려요",
    description: "종이컵을 번갈아 하나씩 쌓아 탑을 만들고 함께 무너뜨린다.",
    durationMinutes: 15,
    durationLabel: "15분",
    categoryId: "cognitive",
    categoryLabel: "인지발달",
    sourceLabel: "Tomasello 1995",
    isFavorite: false,
  },
  {
    missionId: "demo-ball",
    title: "공 굴려 주고받기",
    shortTitle: "마주 앉아 공을 굴려 주고받아요",
    description: "다리를 벌리고 마주 앉아 공을 굴려 주고받는다.",
    durationMinutes: 10,
    durationLabel: "10분",
    categoryId: "physical",
    categoryLabel: "신체발달",
    sourceLabel: "WHO 2023",
    isFavorite: false,
  },
];

const readDemoFavorites = (): Record<string, string> => {
  try {
    const raw = window.sessionStorage.getItem(DEMO_FAVORITES_KEY);
    if (raw) return JSON.parse(raw) as Record<string, string>;
  } catch {
    // 저장소 접근 불가 — 기본값 사용
  }
  // 처음 열면 Figma처럼 몇 개가 저장된 상태로 보여 준다.
  const now = Date.now();
  return {
    "demo-mission": new Date(now - 60_000).toISOString(),
    "demo-peekaboo": new Date(now - 86_400_000).toISOString(),
    "demo-cups": new Date(now - 3 * 86_400_000).toISOString(),
  };
};

const writeDemoFavorites = (value: Record<string, string>) => {
  try {
    window.sessionStorage.setItem(DEMO_FAVORITES_KEY, JSON.stringify(value));
  } catch {
    // 무시
  }
};

const matches = (item: LibraryPlayItem, query: LibraryQuery) => {
  const q = query.q?.trim().toLowerCase();
  if (q && !item.title.toLowerCase().includes(q)) return false;
  if (query.categoryId && item.categoryId !== query.categoryId) return false;
  return true;
};

const sortByDate = <T>(items: T[], date: (item: T) => string, order?: LibraryOrder) =>
  [...items].sort((a, b) => {
    const diff = new Date(date(b)).getTime() - new Date(date(a)).getTime();
    return order === "oldest" ? -diff : diff;
  });

export const isDemoFavorite = (missionId: string) =>
  Boolean(readDemoFavorites()[missionId]);

const demoFavorites = (query: LibraryQuery): LibraryList<FavoritePlayItem> => {
  const saved = readDemoFavorites();
  const items = DEMO_PLAYS.filter((play) => saved[play.missionId])
    .map((play) => ({ ...play, isFavorite: true, savedAt: saved[play.missionId] }))
    .filter((item) => matches(item, query));
  return { items: sortByDate(items, (i) => i.savedAt, query.order), total: items.length, source: "demo" };
};

const demoHistory = (query: LibraryQuery): LibraryList<PlayHistoryItem> => {
  const saved = readDemoFavorites();
  const now = new Date();
  const at = (daysAgo: number, hour: number, minute: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };
  const rows: Array<[LibraryPlayItem, string]> = [
    [DEMO_PLAYS[0], at(0, 10, 5)],
    [DEMO_PLAYS[2], at(1, 16, 10)],
    [DEMO_PLAYS[1], at(3, 11, 30)],
    [DEMO_PLAYS[3], at(6, 9, 40)],
  ];
  const items = rows
    .map(([play, completedAt], index) => ({
      ...play,
      isFavorite: Boolean(saved[play.missionId]),
      executionId: `demo-history-${index}`,
      childId: "demo-child-youse",
      status: "completed" as const,
      completedAt,
      actualDurationSeconds: play.durationMinutes * 60,
      hasFeedback: index % 2 === 0,
    }))
    .filter((item) => matches(item, query));
  return { items: sortByDate(items, (i) => i.completedAt, query.order), total: items.length, source: "demo" };
};

/* ───────────── API ───────────── */

export const listFavoritePlays = async (
  query: LibraryQuery,
): Promise<LibraryList<FavoritePlayItem>> => {
  const headers = await authHeaders();
  if (!headers.Authorization) return demoFavorites(query);
  const data = await request<{ items: FavoritePlayItem[]; total: number }>(
    `/missions/favorites${toQueryString(query)}`,
    { method: "GET", headers },
  );
  return { ...data, source: "api" };
};

export const listPlayHistory = async (
  query: LibraryQuery & { childId?: string | null },
): Promise<LibraryList<PlayHistoryItem>> => {
  const headers = await authHeaders();
  if (!headers.Authorization) return demoHistory(query);
  const data = await request<{ items: PlayHistoryItem[]; total: number }>(
    `/mission-executions/history${toQueryString(
      query,
      query.childId ? { childId: query.childId } : undefined,
    )}`,
    { method: "GET", headers },
  );
  return { ...data, source: "api" };
};

// 한 달치 놀이 내역 — 서버 기간 조회(from 포함 ~ to 미포함)로 그 달만 받는다.
export const listPlayHistoryForMonth = async ({
  year,
  month,
  q,
  categoryId,
  order = "latest",
}: LibraryQuery & { year: number; month: number }): Promise<LibraryList<PlayHistoryItem>> => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const headers = await authHeaders();
  if (!headers.Authorization) {
    const demo = demoHistory({ q, categoryId, order });
    const items = demo.items.filter((item) => {
      const time = new Date(item.completedAt).getTime();
      return time >= start.getTime() && time < end.getTime();
    });
    return { items, total: items.length, source: "demo" };
  }

  // 한 달에 100개를 넘는 경우를 대비해 끝까지 이어 받는다.
  const PAGE = 100;
  const items: PlayHistoryItem[] = [];
  let total = 0;
  for (let offset = 0; offset < 1000; offset += PAGE) {
    const data = await request<{ items: PlayHistoryItem[]; total: number }>(
      `/mission-executions/history${toQueryString(
        { q, categoryId, order },
        {
          from: start.toISOString(),
          to: end.toISOString(),
          limit: String(PAGE),
          offset: String(offset),
        },
      )}`,
      { method: "GET", headers },
    );
    items.push(...data.items);
    total = data.total;
    if (items.length >= total || data.items.length < PAGE) break;
  }
  return { items, total, source: "api" };
};

export const setPlayFavorite = async (
  missionId: string,
  favorite: boolean,
): Promise<{ missionId: string; isFavorite: boolean }> => {
  const headers = await authHeaders();
  if (!headers.Authorization) {
    const saved = readDemoFavorites();
    if (favorite) saved[missionId] = new Date().toISOString();
    else delete saved[missionId];
    writeDemoFavorites(saved);
    return { missionId, isFavorite: favorite };
  }
  return request<{ missionId: string; isFavorite: boolean }>(
    `/missions/${missionId}/favorite`,
    { method: favorite ? "PUT" : "DELETE", headers },
  );
};

/* ───────────── 목록 → 놀이 상세 전달 ───────────── */

// 관심 놀이·놀이 내역에서 고른 놀이를 상세 화면으로 넘긴다(상세 조회 API가 없어 목록 데이터를 그대로 쓴다).
const SELECTED_PLAY_KEY = "library:selected-play";

export const rememberSelectedPlay = (item: LibraryPlayItem) => {
  try {
    window.sessionStorage.setItem(SELECTED_PLAY_KEY, JSON.stringify(item));
  } catch {
    // 무시 — 상세 화면이 목록을 다시 불러온다
  }
};

export const readSelectedPlay = (missionId: string): LibraryPlayItem | null => {
  try {
    const raw = window.sessionStorage.getItem(SELECTED_PLAY_KEY);
    if (!raw) return null;
    const item = JSON.parse(raw) as LibraryPlayItem;
    return item.missionId === missionId ? item : null;
  } catch {
    return null;
  }
};
