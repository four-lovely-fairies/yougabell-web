export const SELECTED_CHILD_COOKIE = "yougabell-selected-child-id";

export const getStoredSelectedChildId = (): string | null => {
  if (typeof document === "undefined") return null;
  const prefix = `${SELECTED_CHILD_COOKIE}=`;
  const entry = document.cookie
    .split("; ")
    .find((part) => part.startsWith(prefix));
  if (!entry) return null;
  try {
    return decodeURIComponent(entry.slice(prefix.length)) || null;
  } catch {
    return null;
  }
};

export const setStoredSelectedChildId = (childId: string) => {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SELECTED_CHILD_COOKIE}=${encodeURIComponent(childId)}; Path=/; SameSite=Lax${secure}`;
};

export const clearStoredSelectedChildId = () => {
  if (typeof document === "undefined") return;
  document.cookie = `${SELECTED_CHILD_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0`;
};
