import { ApiError, authHeaders, request } from "./client";
import type { HomeMoodCheck } from "./types";

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
