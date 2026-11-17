import { SavedPlayDetailScreen } from "@/components/mission/library/saved-play-detail";
import { redirect } from "next/navigation";

export default async function SavedPlayDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ missionId?: string }>;
}) {
  const { missionId } = await searchParams;
  if (!missionId) redirect("/mission/saved");
  return <SavedPlayDetailScreen missionId={missionId} />;
}
