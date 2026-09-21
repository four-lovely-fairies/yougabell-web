"use client";

export default function MainError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gray-20 px-6 text-center">
      <p className="text-sm leading-normal text-gray-500">
        화면 정보를 불러오지 못했어요.
        <br />
        잠시 후 다시 시도해 주세요.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-primary-300 px-5 py-2 text-sm font-medium text-white"
      >
        다시 시도
      </button>
    </div>
  );
}
