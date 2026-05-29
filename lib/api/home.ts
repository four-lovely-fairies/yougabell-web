import { ApiError, authHeaders, openApiClient, request } from "./client";
import { clearStoredSelectedChildId } from "./storage";
import type { HomeLoadState, HomeMoodCheck } from "./types";
import type { HomeDashboard } from "../home-data";

export const loadHomeDashboard = async (
  childId?: string | null,
): Promise<HomeLoadState> => {
  const headers = await authHeaders();

  if (!headers.Authorization) {
    throw new ApiError(401, {
      message: "로그인 세션이 연결되어야 홈을 불러올 수 있습니다.",
    });
  }

  const fetchHome = async (id?: string | null): Promise<HomeDashboard> => {
    const { data, error, response } = await openApiClient.GET("/home", {
      params: { query: { childId: id ?? undefined } },
      headers,
    });
    const status = (response as Response).status;
    if (error) {
      throw new ApiError(status, error);
    }
    if (!data) {
      throw new ApiError(status, {});
    }
    return data;
  };

  try {
    return { data: await fetchHome(childId) };
  } catch (error) {
    // 저장된 자녀 id가 더 이상 유효하지 않으면(삭제됐거나 과거 잔재) 비우고
    // 기본 자녀로 1회 재시도해 자가 치유한다.
    if (childId && error instanceof ApiError && error.status === 404) {
      clearStoredSelectedChildId();
      return { data: await fetchHome(null) };
    }
    throw error;
  }
};

export const submitHomeMoodCheck = async (
  level: 1 | 2 | 3 | 4 | 5,
): Promise<HomeMoodCheck> => {
  const headers = await authHeaders();

  if (!headers.Authorization) {
    throw new ApiError(401, {
      message: "로그인 세션이 연결되어야 오늘의 기분을 기록할 수 있습니다.",
    });
  }

  return request<HomeMoodCheck>("/home/mood", {
    method: "POST",
    headers,
    json: { level },
  });
};
