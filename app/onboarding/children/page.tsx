"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlusIcon } from "@/components/icons";
import { ChildCardForm, ChildRow } from "@/components/onboarding/child-card";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Button } from "@/components/ui/button";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { track } from "@/lib/analytics";
import type { ChildDraft } from "@/lib/types";
import { cn, newTempId } from "@/lib/utils";

function emptyChild(): ChildDraft {
  return { tempId: newTempId() };
}

function isValid(c: ChildDraft) {
  return Boolean(c.name && c.birthDate && c.gender);
}

export default function ChildrenPage() {
  const router = useRouter();
  const { draft, patch } = useOnboardingDraft();
  const [children, setChildren] = useState<ChildDraft[]>(() => {
    const saved = draft?.children ?? [];
    return saved.length > 0 ? saved : [emptyChild()];
  });
  const [editingId, setEditingId] = useState<string | null>(
    children[0]?.tempId ?? null,
  );
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const updateChild = (id: string, next: Partial<ChildDraft>) => {
    setChildren((prev) =>
      prev.map((c) => (c.tempId === id ? { ...c, ...next } : c)),
    );
  };

  const removeChild = (id: string) => {
    setChildren((prev) => {
      const next = prev.filter((c) => c.tempId !== id);
      return next.length > 0 ? next : [emptyChild()];
    });
    setPendingDeleteId(null);
    setEditingId(null);
  };

  const editingChild = children.find((c) => c.tempId === editingId);
  const canAddChild = editingChild === undefined || isValid(editingChild);

  const addChild = () => {
    // 편집 중인 자녀가 있으면 유효한 경우에만 추가 허용 (자동 저장)
    if (!canAddChild) return;
    const next = emptyChild();
    setChildren((prev) => [...prev, next]);
    setEditingId(next.tempId);
  };

  const saveCurrent = () => {
    const current = children.find((c) => c.tempId === editingId);
    if (!current || !isValid(current)) return;
    setEditingId(null);
  };

  const allValid = children.length >= 1 && children.every(isValid);
  const canProceed = allValid && editingId === null;

  // 흐름 분기: 알림 허용 시 app-usage에서, 거부 시 notification에서 진입.
  const back = () => {
    const previous =
      draft?.notificationPermission === "granted"
        ? "/onboarding/app-usage"
        : "/onboarding/notification";
    router.push(previous);
  };
  const submit = () => {
    if (!canProceed) return;
    patch({ children, lastStep: "children" });
    track({ type: "onboarding_step_complete", step: "children" });
    router.push("/onboarding/done");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col flex-1"
    >
      <OnboardingHeader variant="back" onAction={back} />

      <header className="mt-2 mb-7">
        <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.2px] text-gray-800">
          아이 정보를
          <br />
          입력해 주세요
        </h1>
      </header>

      <div className="flex flex-col gap-3">
        {children.map((c, idx) => {
          const isEditing = editingId === c.tempId;
          if (isEditing) {
            return (
              <ChildCardForm
                key={c.tempId}
                index={idx}
                child={c}
                onChange={(next) => updateChild(c.tempId, next)}
                onRemove={
                  idx > 0 ? () => setPendingDeleteId(c.tempId) : undefined
                }
              />
            );
          }
          return (
            <ChildRow
              key={c.tempId}
              child={c}
              onEdit={() => setEditingId(c.tempId)}
              onDelete={() => setPendingDeleteId(c.tempId)}
            />
          );
        })}

        {/* Figma 2146:4948 — dashed 1.358px, rounded 16, 보라 #b69cfe / text #9572ff */}
        <button
          type="button"
          onClick={addChild}
          disabled={!canAddChild}
          className={cn(
            "flex h-13 items-center justify-center gap-[7px] rounded-2xl border-[1.358px] border-dashed transition-colors",
            !canAddChild
              ? "cursor-not-allowed border-gray-200 text-gray-300"
              : "border-[#b69cfe] text-[#9572ff] hover:bg-primary-50",
          )}
        >
          <PlusIcon size={20} />
          <span className="text-sm font-medium tracking-[-0.3px]">
            자녀 추가
          </span>
        </button>
      </div>

      <div className="flex-1 min-h-8" />

      {editingId ? (
        <Button
          type="button"
          size="full"
          onClick={saveCurrent}
          disabled={!isValid(children.find((c) => c.tempId === editingId)!)}
        >
          저장
        </Button>
      ) : (
        <Button type="submit" size="full" disabled={!canProceed}>
          저장
        </Button>
      )}

      {pendingDeleteId ? (
        <DeleteConfirm
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => removeChild(pendingDeleteId)}
        />
      ) : null}
    </form>
  );
}

function DeleteConfirm({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  // Figma 2146:5045 — 중앙 정렬 모달 (334w / icon + 본문 + 취소·삭제하기)
  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-6"
      onClick={onCancel}
    >
      <div
        className="flex w-full max-w-[334px] flex-col rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3 px-4 pt-6 pb-2">
          {/* Figma 2146:5045 image 598 — sprite의 한 캐릭터 영역만 crop 노출(82×67) */}
          <div className="relative h-[67px] w-[82px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/onboarding/intro.png"
              alt=""
              aria-hidden
              className="absolute left-[-23.76%] top-[-20.27%] h-[381.08%] w-[381.22%] max-w-none"
            />
          </div>
          <p className="pt-2 text-center text-lg font-bold leading-[1.4] text-gray-800">
            자녀 정보를 삭제하시겠습니까?
          </p>
        </div>
        <div className="flex gap-1.5 px-4 pt-4 pb-5">
          <Button
            size="md"
            className="flex-1 bg-gray-50 text-gray-800 hover:bg-gray-100"
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
