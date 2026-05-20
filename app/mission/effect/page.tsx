import { MissionEffectScreen } from "@/components/mission/mission-screens";

export default async function MissionEffectPage({
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
    <MissionEffectScreen executionId={params.executionId ?? null} mode={mode} />
  );
}
