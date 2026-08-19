import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") ? next : "/";
  const error = requestUrl.searchParams.get("error");

  if (error) {
    const redirectUrl = new URL("/onboarding/intro", requestUrl.origin);
    redirectUrl.searchParams.set("error", "oauth_failed");
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/onboarding/intro", requestUrl.origin),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const redirectUrl = new URL("/onboarding/intro", requestUrl.origin);
    redirectUrl.searchParams.set("error", "session_exchange_failed");
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}
