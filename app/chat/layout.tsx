import { getAppRedirectPath } from "@/lib/auth-routing";
import { fetchServerMe } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function ChatLayout({ children }: { children: ReactNode }) {
  const me = await fetchServerMe();
  const redirectPath = getAppRedirectPath({
    hasSession: Boolean(me),
    onboardedAt: me?.onboardedAt ?? null,
  });

  if (redirectPath) {
    redirect(redirectPath);
  }

  return <main className="min-h-dvh overflow-x-hidden bg-gray-20 text-gray-800">{children}</main>;
}
