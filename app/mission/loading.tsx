import { MissionContentSkeleton } from "@/components/mission/mission-screens/shared";

// 놀이 화면으로 넘어가는 동안 바로 보여 주는 자리표시 (버튼을 눌렀는데 멈춘 것처럼 보이지 않게).
export default function MissionLoading() {
  return <MissionContentSkeleton />;
}
