"use client";

import type { ChildDraft } from "@/lib/types";
import { DateTriple } from "./date-triple";
import { SegmentedToggle } from "./segmented-toggle";

type ChildCardProps = {
  index: number;
  child: ChildDraft;
  onChange: (next: ChildDraft) => void;
  onRemove?: () => void;
};

export function ChildCard({ index, child, onChange, onRemove }: ChildCardProps) {
  const patch = (next: Partial<ChildDraft>) => onChange({ ...child, ...next });

  return (
    <div className="rounded-2xl border border-zinc-200 p-6 space-y-5 bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">자녀 {index + 1}</h3>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-zinc-500 hover:text-zinc-900"
          >
            삭제
          </button>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">이름 *</label>
        <input
          type="text"
          maxLength={30}
          placeholder="아이 이름"
          value={child.name ?? ""}
          onChange={(e) => patch({ name: e.target.value })}
          className="w-full h-12 px-4 rounded-xl border border-zinc-300 bg-white"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">생년월일 *</label>
        <DateTriple
          value={child.birthDate}
          onChange={(iso) => patch({ birthDate: iso })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">성별 *</label>
        <SegmentedToggle
          ariaLabel="자녀 성별"
          options={[
            { value: "female", label: "여아" },
            { value: "male", label: "남아" },
          ]}
          value={child.gender ?? null}
          onChange={(v) =>
            patch({ gender: v ?? undefined })
          }
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">특이사항</label>
        <textarea
          rows={3}
          maxLength={1000}
          placeholder="식품 알레르기, 발달 이슈, 복용 약 등 (자유 텍스트)"
          value={child.notes ?? ""}
          onChange={(e) => patch({ notes: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-zinc-300 bg-white resize-none"
        />
      </div>
    </div>
  );
}
