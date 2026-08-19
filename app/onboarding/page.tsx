import { redirect } from "next/navigation";

// 인트로 화면의 구현은 `/onboarding/intro` 하나로 통일한다.
// 이 경로는 기존 링크·북마크·구버전 앱 호환을 위한 alias로만 남기고,
// OAuth 콜백이 붙여 보내는 `?error=` 같은 쿼리스트링은 그대로 넘긴다.
export default async function OnboardingEntryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        query.append(key, item);
      }
      continue;
    }

    if (value !== undefined) {
      query.set(key, value);
    }
  }

  const search = query.toString();
  redirect(search ? `/onboarding/intro?${search}` : "/onboarding/intro");
}
