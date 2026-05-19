import { redirect } from "next/navigation";
import { getOnboardingRedirectPath } from "@/lib/auth-routing";
import { fetchServerMe } from "@/lib/supabase/server";

export default async function ProtectedOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await fetchServerMe();
  const redirectPath = getOnboardingRedirectPath({
    pathname: "/onboarding/protected",
    hasSession: Boolean(me),
    onboardedAt: me?.onboardedAt ?? null,
  });

  if (redirectPath) {
    redirect(redirectPath);
  }

  return children;
}
