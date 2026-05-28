import { MissionDoneScreen } from "@/components/mission/mission-screens";

export default async function MissionDonePage({
  searchParams,
}: {
  searchParams: Promise<{
    executionId?: string;
  }>;
}) {
  const params = await searchParams;

  return <MissionDoneScreen executionId={params.executionId ?? null} />;
}
