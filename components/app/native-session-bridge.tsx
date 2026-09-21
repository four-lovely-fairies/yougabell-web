"use client";

import { useEffect } from "react";

import {
  isNativeWebView,
  subscribeToNativeMessages,
} from "@/lib/native-bridge";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearStoredSelectedChildId } from "@/lib/api/storage";

export function NativeSessionBridge() {
  useEffect(() => {
    if (!isNativeWebView()) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const unsubscribe = subscribeToNativeMessages((message) => {
      void (async () => {
        switch (message.type) {
          case "SUPABASE_SESSION_SYNC": {
            const { data } = await supabase.auth.getSession();
            const current = data.session;

            if (
              current?.access_token === message.payload.accessToken &&
              current?.refresh_token === message.payload.refreshToken
            ) {
              return;
            }

            const { data: synced } = await supabase.auth.setSession({
              access_token: message.payload.accessToken,
              refresh_token: message.payload.refreshToken,
            });
            if (current?.user.id && synced.user?.id !== current.user.id) {
              clearStoredSelectedChildId();
            }
            return;
          }
          case "SUPABASE_SESSION_CLEARED": {
            clearStoredSelectedChildId();
            const { data } = await supabase.auth.getSession();

            if (!data.session) {
              return;
            }

            await supabase.auth.signOut();
            return;
          }
          case "NATIVE_GOOGLE_SIGN_IN_CANCELLED":
          case "NATIVE_GOOGLE_SIGN_IN_ERROR":
          case "NATIVE_APPLE_SIGN_IN_CANCELLED":
          case "NATIVE_APPLE_SIGN_IN_ERROR":
            return;
          default:
            return;
        }
      })();
    });

    return unsubscribe;
  }, []);

  return null;
}
