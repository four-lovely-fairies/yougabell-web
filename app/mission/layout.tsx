import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAppRedirectPath } from "@/lib/auth-routing";
import { fetchServerMe } from "@/lib/supabase/server";

export default async function MissionLayout({ children }: { children: ReactNode }) {
  const me = await fetchServerMe();
  const redirectPath = getAppRedirectPath({
    hasSession: Boolean(me),
    onboardedAt: me?.onboardedAt ?? null,
  });

  if (redirectPath) {
    redirect(redirectPath);
  }

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#fdfdfe] text-[#262626]">
      <div className="relative min-h-dvh w-full overflow-hidden md:mx-auto md:max-w-[390px]">
        {children}
      </div>
    </main>
  );
}
