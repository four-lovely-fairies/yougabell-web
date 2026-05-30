import { ApiError, authHeaders, openApiClient } from "./client";
import type { RoadmapLoadState } from "./types";
import { getDemoRoadmap } from "../roadmap-data";

export const loadRoadmap = async ({
  childId,
  targetMonth,
}: {
  childId?: string | null;
  targetMonth?: number | null;
} = {}): Promise<RoadmapLoadState> => {
  const headers = await authHeaders();

  if (!headers.Authorization) {
    return {
      data: getDemoRoadmap(),
      source: "demo",
      message: "로그인 세션이 연결되면 실제 로드맵을 표시합니다.",
    };
  }

  try {
    const { data, error, response } = await openApiClient.GET("/me/roadmap", {
      params: {
        query: {
          childId: childId ?? undefined,
          targetMonth: targetMonth ?? undefined,
        },
      },
      headers,
    });
    const status = response.status;

    if (error) {
      throw new ApiError(status, error);
    }
    if (!data) {
      throw new ApiError(status, {});
    }

    return { data, source: "api" };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? `API 응답을 가져오지 못해 샘플 데이터를 표시합니다. (${error.status})`
        : "API 서버에 연결할 수 없어 샘플 데이터를 표시합니다.";

    return {
      data: getDemoRoadmap(),
      source: "demo",
      message,
    };
  }
};
