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

  if (pathname === "/onboarding/intro") {
    return null;
  }

  if (!hasSession) {
    return "/onboarding/intro";
  }

  return null;
}

export function getAppRedirectPath({
  hasSession,
  onboardedAt,
}: AuthRoutingInput): string | null {
  if (!hasSession) {
    return "/onboarding/intro";
  }

  if (!onboardedAt) {
    return "/onboarding/intro";
  }

  return null;
}
