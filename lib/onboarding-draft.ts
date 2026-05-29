import type {
  OnboardingDraft,
  OnboardingStep,
} from "@/lib/types";

export type DraftPatch = Partial<
  Omit<OnboardingDraft, "schemaVersion" | "updatedAt">
>;

export function mergeOnboardingDraft(
  prev: OnboardingDraft | null,
  next: DraftPatch,
): OnboardingDraft {
  return {
    schemaVersion: 3,
    lastStep: next.lastStep ?? prev?.lastStep ?? "intro",
    parent: next.parent ?? prev?.parent,
    consents: next.consents ?? prev?.consents,
    children: next.children ?? prev?.children,
    interests: next.interests ?? prev?.interests,
    notification: next.notification ?? prev?.notification,
    notificationPermission:
      next.notificationPermission ?? prev?.notificationPermission,
    updatedAt: new Date().toISOString(),
  };
}

const STEP_TO_PATH: Record<OnboardingStep, string> = {
  intro: "/onboarding/parent",
  consent: "/onboarding/consent",
  parent: "/onboarding/parent",
  interest: "/onboarding/interest",
  notification: "/onboarding/notification",
  "app-usage": "/onboarding/app-usage",
  children: "/onboarding/children",
};

export function getOnboardingResumePath(
  draft: OnboardingDraft | null,
): string {
  if (!draft) {
    return "/onboarding/parent";
  }

  return STEP_TO_PATH[draft.lastStep] ?? "/onboarding/parent";
}
