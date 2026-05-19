import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { MainAppShell } from "@/components/app/main-app-shell";
import { getAppRedirectPath } from "@/lib/auth-routing";
import { fetchServerMe } from "@/lib/supabase/server";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const me = await fetchServerMe();
  const redirectPath = getAppRedirectPath({
    hasSession: Boolean(me),
    onboardedAt: me?.onboardedAt ?? null,
  });

  if (redirectPath) {
    redirect(redirectPath);
  }

  return <MainAppShell>{children}</MainAppShell>;
}
