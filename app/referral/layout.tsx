import { getAppRedirectPath } from "@/lib/auth-routing";
import { fetchServerMe } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function ReferralLayout({
  children,
}: {
  children: ReactNode;
}) {
  const me = await fetchServerMe();
  const redirectPath = getAppRedirectPath({
    hasSession: Boolean(me),
    onboardedAt: me?.onboardedAt ?? null,
  });

  if (redirectPath) {
    redirect(redirectPath);
  }

  return <main className="bg-white text-gray-800">{children}</main>;
}
