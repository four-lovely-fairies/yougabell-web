import { MissionEffectScreen } from "@/components/mission/mission-screens";

export default async function MissionEffectPage({
  searchParams,
}: {
  searchParams: Promise<{
    executionId?: string;
  }>;
}) {
  const params = await searchParams;

  return <MissionEffectScreen executionId={params.executionId ?? null} />;
}
