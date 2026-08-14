"use client";

import { resetAnalyticsIdentity, setAnalyticsUserId } from "@/lib/analytics";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useEffect } from "react";

function syncUser(session: Session | null): void {
  if (session) {
    setAnalyticsUserId(session.user.id);
  }
}

/** Supabase 인증 상태를 Amplitude의 pseudonymous 사용자 식별자에만 동기화한다. */
export function AmplitudeIdentity() {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    void supabase.auth.getSession().then(({ data }) => {
      syncUser(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (session) {
          syncUser(session);
          return;
        }

        if (event === "SIGNED_OUT" || event === "USER_DELETED") {
          resetAnalyticsIdentity();
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
