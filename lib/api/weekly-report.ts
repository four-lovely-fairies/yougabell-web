import { ApiError, authHeaders, openApiClient } from "./client";
import type { WeeklyReportLoadState } from "./types";
import type {
  WeeklyReportCurrent,
  WeeklyReportDetail,
  WeeklyReportViewData,
} from "../weekly-report-data";

export const loadWeeklyReport = async ({
  childId,
  reportId,
}: {
  childId?: string | null;
  reportId?: string | null;
} = {}): Promise<WeeklyReportLoadState> => {
  const headers = await authHeaders();

  if (!headers.Authorization) {
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
