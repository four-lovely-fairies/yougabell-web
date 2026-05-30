import { MoreHorizontal } from "lucide-react";

export const HomeSkeleton = () => (
  <div className="flex min-h-dvh items-center justify-center bg-gray-20">
    <MoreHorizontal
      className="size-8 animate-pulse text-primary-300"
      aria-label="홈 불러오는 중"
    />
  </div>
);

export const HomeError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gray-20 px-6 text-center">
    <p className="text-sm leading-normal text-gray-500">
      홈 정보를 불러오지 못했어요.
      <br />
      잠시 후 다시 시도해 주세요.
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="rounded-full bg-primary-300 px-5 py-2 text-sm font-medium text-white"
    >
      다시 시도
    </button>
  </div>
);
