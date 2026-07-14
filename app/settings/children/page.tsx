"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { ChildRow } from "@/components/onboarding/child-card";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { ChildDraft, MeResponse } from "@/lib/types";

type Item = MeResponse["children"][number];

function toDraft(c: Item): ChildDraft {
  return {
    tempId: c.id,
    name: c.name,
    birthDate: c.birthDate,
    gender: c.gender,
    notes: c.notes ?? undefined,
  };
}

/** 자녀 프로필 목록 — Figma 2395:9362. */
export default function SettingsChildrenPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const me = await api.getMe();
        setChildren(me.children);
      } catch {
        setError("자녀 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onDelete = async (id: string) => {
    setPendingDeleteId(null);
    setError(null);
    try {
      await api.deleteChild(id);
      track({ type: "settings_child_delete", childId: id });
      setChildren((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.status === 409
            ? "마지막 자녀는 삭제할 수 없어요."
            : `삭제 실패 (${e.status})`
          : "네트워크 오류";
      setError(message);
    }
  };

  return (
    <div className="flex h-dvh flex-col px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
      <OnboardingHeader variant="back" />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <header className="py-6">
          <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
            아이 정보를
            <br />
            입력해 주세요
          </h1>
        </header>

        <div className="flex flex-col gap-3">
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-400">
              불러오는 중...
            </p>
          ) : children.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              등록된 자녀가 없어요.
            </p>
          ) : (
            children.map((c) => (
              <ChildRow
                key={c.id}
                child={toDraft(c)}
                onEdit={() => router.push(`/settings/children/${c.id}`)}
                onDelete={() => setPendingDeleteId(c.id)}
              />
            ))
          )}

          <button
            type="button"
            onClick={() => router.push("/settings/children/new")}
            className={cn(
              "flex h-13 items-center justify-center gap-1.75 rounded-2xl border-[1.358px] border-dashed border-[#dab2ff] text-[#9349f4] transition-colors hover:bg-primary-50",
            )}
          >
            <PlusIcon size={20} />
            <span className="text-sm font-medium tracking-[-0.3px]">
              자녀 추가
            </span>
          </button>
        </div>
      </div>

      <div className="shrink-0">
        {error ? (
          <p className="pb-2 text-center text-sm text-red-500">{error}</p>
        ) : null}

        <Button
          type="button"
          size="full"
          disabled={children.length === 0}
          onClick={() => router.back()}
        >
          다음
        </Button>
      </div>

      {pendingDeleteId ? (
        <DeleteConfirm
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => void onDelete(pendingDeleteId)}
        />
      ) : null}
    </div>
  );
}

function DeleteConfirm({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-6"
      onClick={onCancel}
    >
      <div
        className="flex w-full max-w-83.5 flex-col rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3 px-4 pt-6 pb-2">
          <div
            aria-hidden
            className="flex size-17 items-center justify-center rounded-full bg-error-50 text-error-600"
          >
            <TrashIcon size={32} />
          </div>
          <p className="pt-2 text-center text-lg font-bold leading-[1.4] text-gray-800">
            자녀 정보를 삭제하시겠습니까?
          </p>
        </div>
        <div className="flex gap-1.5 px-4 pt-4 pb-5">
          <Button
            size="md"
            className="flex-1 bg-[#f2f3f5] text-gray-800 hover:bg-gray-100"
            variant="outline"
            onClick={onCancel}
          >
            취소
          </Button>
          <Button size="md" className="flex-1" onClick={onConfirm}>
            삭제하기
          </Button>
        </div>
      </div>
    </div>
  );
}
