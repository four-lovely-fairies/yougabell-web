import { MissionFeedbackScreen } from "@/components/mission/mission-screens";

export default async function MissionFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{
    executionId?: string;
  }>;
}) {
  const params = await searchParams;

  return <MissionFeedbackScreen executionId={params.executionId ?? null} />;
}
