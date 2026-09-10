export type PushPermissionStatus = "granted" | "denied" | "undetermined" | null;

export type HomeNotificationStep =
  | "configured"
  | "schedule"
  | "request"
  | "settings"
  | "register";

export function resolveHomeNotificationStep({
  configured,
  native,
  permission,
}: {
  configured: boolean;
  native: boolean;
  permission: PushPermissionStatus;
}): HomeNotificationStep {
  if (configured) return "configured";
  if (!native) return "schedule";
  if (permission === "granted") return "register";
  if (permission === "denied") return "settings";
  return "request";
}
