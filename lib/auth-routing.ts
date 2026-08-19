// 온보딩 인트로의 정본 경로. `/onboarding`은 alias로만 남아 이 경로로 redirect된다.
const ONBOARDING_INTRO_PATH = "/onboarding/intro";

type AuthRoutingInput = {
  hasSession: boolean;
  onboardedAt: string | null;
};

type OnboardingRoutingInput = AuthRoutingInput & {
  pathname: string;
};

export function getOnboardingRedirectPath({
  pathname,
  hasSession,
  onboardedAt,
}: OnboardingRoutingInput): string | null {
  if (onboardedAt) {
    return "/";
  }

  if (pathname === ONBOARDING_INTRO_PATH) {
    return null;
  }

  if (!hasSession) {
    return ONBOARDING_INTRO_PATH;
  }

  return null;
}

export function getAppRedirectPath({
  hasSession,
  onboardedAt,
}: AuthRoutingInput): string | null {
  if (!hasSession) {
    return ONBOARDING_INTRO_PATH;
  }

  if (!onboardedAt) {
    return ONBOARDING_INTRO_PATH;
  }

  return null;
}
