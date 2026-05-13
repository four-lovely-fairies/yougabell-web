import createClient from "openapi-fetch";
import type { paths } from "./generated/api-types";
import { getDemoHomeDashboard, type HomeDashboard } from "./home-data";
import type { CompleteOnboardingPayload, MeResponse } from "./types";
import type {
  WeeklyReportCurrent,
  WeeklyReportDetail,
  WeeklyReportViewData,
} from "./weekly-report-data";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
const openApiClient = createClient<paths>({ baseUrl: BASE_URL });

/**
 * TODO(auth): Supabase 세션에서 토큰을 추출해 Authorization 헤더로 전달.
 * 현재는 api의 JwtAuthGuard placeholder에 맞춰 x-user-id 헤더로 임시 인증.
 */
function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const tempUserId = window.localStorage.getItem("dev:userId");
  return tempUserId ? { "x-user-id": tempUserId } : {};
}

export type HomeLoadState = {
  data: HomeDashboard;
  source: "api" | "demo";
  message?: string;
};

export type WeeklyReportLoadState =
  | {
      data: WeeklyReportViewData;
      error: null;
    }
  | {
      data: null;
      error: {
        status: number | null;
        message: string;
      };
    };

async function request<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, headers, ...rest } = init ?? {};
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(headers as Record<string, string> | undefined),
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body);
  }
  return (await res.json()) as T;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`API ${status}`);
  }
}

export const api = {
  getMe: () => request<MeResponse>("/me"),
  completeOnboarding: (payload: CompleteOnboardingPayload) =>
    request<MeResponse>("/onboarding/complete", {
      method: "POST",
      json: payload,
    }),
};

export const loadHomeDashboard = async (
  childId?: string | null,
): Promise<HomeLoadState> => {
  const headers = authHeaders();

  if (!headers["x-user-id"]) {
    return {
      data: getDemoHomeDashboard(),
      source: "demo",
      message: "로그인 세션이 연결되면 실제 홈 데이터를 표시합니다.",
    };
  }

  try {
    const { data, error, response } = await openApiClient.GET("/home", {
      params: {
        query: {
          childId: childId ?? undefined,
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

    return {
      data,
      source: "api",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? `API 응답을 가져오지 못해 샘플 데이터를 표시합니다. (${error.status})`
        : "API 서버에 연결할 수 없어 샘플 데이터를 표시합니다.";

    return {
      data: getDemoHomeDashboard(),
      source: "demo",
      message,
    };
  }
};

export const loadWeeklyReport = async ({
  childId,
  reportId,
}: {
  childId?: string | null;
  reportId?: string | null;
} = {}): Promise<WeeklyReportLoadState> => {
  const headers = authHeaders();

  if (!headers["x-user-id"]) {
    return {
      data: null,
      error: {
        status: 401,
        message: "로그인 세션이 연결되어야 주간 리포트를 불러올 수 있습니다.",
      },
    };
  }

  try {
    if (reportId) {
      const { data, error, response } = await openApiClient.GET(
        "/weekly-reports/{id}",
        {
          params: { path: { id: reportId } },
          headers,
        },
      );
      if (error || !data) {
        throw new ApiError((response as Response).status, error ?? {});
      }
      return {
        data: toWeeklyReportViewData(data),
        error: null,
      };
    }

    const { data, error, response } = await openApiClient.GET(
      "/weekly-reports/current",
      {
        params: {
          query: {
            childId: childId ?? undefined,
          },
        },
        headers,
      },
    );
    if (error || !data) {
      throw new ApiError((response as Response).status, error ?? {});
    }
    return {
      data: toWeeklyReportViewData(data),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        status: error instanceof ApiError ? error.status : null,
        message:
          error instanceof ApiError
            ? "주간 리포트를 불러오지 못했습니다."
            : "API 서버에 연결할 수 없습니다.",
      },
    };
  }
};

function toWeeklyReportViewData(
  data: WeeklyReportCurrent | WeeklyReportDetail,
): WeeklyReportViewData {
  if ("selectedChild" in data) {
    return data;
  }

  return {
    selectedChild: null,
    report: data,
    emptyState: null,
  };
}

export const getStoredSelectedChildId = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem("home:selected-child-id");
};

export const setStoredSelectedChildId = (childId: string) => {
  window.localStorage.setItem("home:selected-child-id", childId);
};
