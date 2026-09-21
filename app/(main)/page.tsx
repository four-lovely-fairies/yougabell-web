import { redirect } from "next/navigation";
import { HomeDashboard } from "@/components/home/home-dashboard";
import { fetchServerHome } from "@/lib/server-home";
import { fetchServerMe } from "@/lib/supabase/server";

export default async function HomePage() {
  const me = await fetchServerMe();
  if (me && !me.onboardedAt) {
    redirect("/onboarding/intro");
  }

  const home = await fetchServerHome();
  return (
    <HomeDashboard
      initialHome={home.data}
      selectionResetRequired={home.selectionResetRequired}
    />
  );
}
