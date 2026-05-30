import { MissionTimerScreen } from "@/components/mission/mission-screens";

export default async function MissionTimerPage({
  searchParams,
}: {
  searchParams: Promise<{
    executionId?: string;
    mode?: string;
  }>;
}) {
  const params = await searchParams;
  const mode =
    params.mode === "api" || params.mode === "demo" ? params.mode : null;

  return (
    <MissionTimerScreen executionId={params.executionId ?? null} mode={mode} />
  );
}
