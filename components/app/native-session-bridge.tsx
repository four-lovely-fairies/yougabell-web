"use client";

import { useEffect } from "react";

import {
  isNativeWebView,
  notifyMobile,
  subscribeToNativeMessages,
} from "@/lib/native-bridge";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function NativeSessionBridge() {
  useEffect(() => {
    if (!isNativeWebView()) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const unsubscribe = subscribeToNativeMessages((message) => {
      void (async () => {
        switch (message.type) {
          case "SUPABASE_SESSION_SYNC":
            await supabase.auth.setSession({
              access_token: message.payload.accessToken,
              refresh_token: message.payload.refreshToken,
            });
            return;
          case "SUPABASE_SESSION_CLEARED":
            await supabase.auth.signOut();
            return;
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

    notifyMobile({ type: "WEB_READY" });

    return unsubscribe;
  }, []);

  return null;
}
