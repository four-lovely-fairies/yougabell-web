export function buildOAuthRedirectTo(origin: string, next: string): string {
  const redirectTo = new URL("/auth/callback", origin);
  redirectTo.searchParams.set("next", next);
  return redirectTo.toString();
}

export function getOAuthErrorMessage(error: string | null): string | null {
  if (error === "oauth_failed" || error === "session_exchange_failed") {
    return "로그인 연결에 실패했습니다. 다시 시도해주세요.";
  }

  if (error) {
    return "로그인 처리 중 문제가 발생했습니다.";
  }

  return null;
}
