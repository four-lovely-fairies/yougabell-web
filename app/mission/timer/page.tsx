import { MissionTimerScreen } from "@/components/mission/mission-screens";

export default async function MissionTimerPage({
  searchParams,
}: {
  searchParams: Promise<{
    executionId?: string;
  }>;
}) {
  const params = await searchParams;

  return <MissionTimerScreen executionId={params.executionId ?? null} />;
}
