import type { CompleteOnboardingPayload, MeResponse } from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

/**
 * TODO(auth): Supabase 세션에서 토큰을 추출해 Authorization 헤더로 전달.
 * 현재는 api의 JwtAuthGuard placeholder에 맞춰 x-user-id 헤더로 임시 인증.
 */
function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const tempUserId = window.localStorage.getItem("dev:userId");
  return tempUserId ? { "x-user-id": tempUserId } : {};
}

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
