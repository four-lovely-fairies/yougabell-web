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

  if (pathname === "/onboarding") {
    return null;
  }

  if (!hasSession) {
    return "/onboarding";
  }

  return null;
}

export function getAppRedirectPath({
  hasSession,
  onboardedAt,
}: AuthRoutingInput): string | null {
  if (!hasSession) {
    return "/onboarding";
  }

  if (!onboardedAt) {
    return "/onboarding";
  }

  return null;
}
