import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import type { HomeDashboard } from "./home-data";
import { SELECTED_CHILD_COOKIE } from "./api/storage";
import { measureServer } from "./server-performance";
import { createSupabaseServerClient } from "./supabase/server";

export type ServerHomeResult = {
  data: HomeDashboard;
  selectionResetRequired: boolean;
};

export const fetchServerHome = cache(async (): Promise<ServerHomeResult> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Home session is unavailable");

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL is required.");

  const childId = (await cookies()).get(SELECTED_CHILD_COOKIE)?.value;
  const fetchHome = (selectedId?: string) =>
    measureServer("server_home", async (record) => {
      const url = new URL("/home", baseUrl);
      if (selectedId) url.searchParams.set("childId", selectedId);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      record(response.headers.get("x-request-id"), response.status);
      return response;
    });

  let response = await fetchHome(childId);
  let selectionResetRequired = false;
  if (childId && response.status === 404) {
    response = await fetchHome();
    selectionResetRequired = true;
  }
  if (!response.ok) throw new Error(`Home API failed (${response.status})`);
  return {
    data: (await response.json()) as HomeDashboard,
    selectionResetRequired,
  };
});
