"use client";

import { PencilIcon, TrashIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
import type { ChildDraft } from "@/lib/types";
import { DateInput } from "./date-input";
import { SegmentedToggle } from "./segmented-toggle";

type ChildCardProps = {
  index: number;
  child: ChildDraft;
  onChange: (next: ChildDraft) => void;
  onRemove?: () => void; // 둘째 이후 카드에만 전달 — 편집 중에도 삭제 가능
};

function genderLabel(g: ChildDraft["gender"]) {
  if (g === "female") return "여아";
  if (g === "male") return "남아";
  return null;
}

function formatDate(iso?: string) {
  if (!iso) return null;
  return iso.replace(/-/g, ".");
}

export function ChildCardForm({
  index,
  child,
  onChange,
  onRemove,
}: ChildCardProps) {
  const patch = (next: Partial<ChildDraft>) => onChange({ ...child, ...next });

  return (
    <div className="rounded-lg border border-gray-100 p-5 flex flex-col gap-5 bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">
          자녀 {index + 1}
        </h3>
        {onRemove ? (
          <IconButton
            label="자녀 삭제"
            onClick={onRemove}
            className="w-9 h-9 text-gray-700"
          >
            <TrashIcon size={18} />
          </IconButton>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-800">
          이름 <span className="text-error-600">*</span>
        </label>
        <Input
          type="text"
          maxLength={30}
          placeholder="아이의 이름을 입력해 주세요."
          value={child.name ?? ""}
          onChange={(e) => patch({ name: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-800">
          생년월일 <span className="text-error-600">*</span>
        </label>
        <DateInput
          value={child.birthDate}
          onChange={(iso) => patch({ birthDate: iso })}
          placeholder="아이의 생년월일을 입력해 주세요."
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-800">
          성별 <span className="text-error-600">*</span>
        </label>
        <SegmentedToggle
          ariaLabel="자녀 성별"
          options={[
            { value: "female", label: "여아" },
            { value: "male", label: "남아" },
          ]}
          value={child.gender ?? null}
          onChange={(v) => patch({ gender: v ?? undefined })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-800">특이사항</label>
        <textarea
          rows={2}
          maxLength={1000}
          placeholder="식품 알레르기, 질병, 복용 중인 약 등"
          value={child.notes ?? ""}
          onChange={(e) => patch({ notes: e.target.value })}
          className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white resize-none text-gray-800 placeholder:text-gray-400 focus:border-primary-500 outline-none"
        />
      </div>
    </div>
  );
}

type ChildRowProps = {
  child: ChildDraft;
  onEdit: () => void;
  onDelete: () => void;
};

export function ChildRow({ child, onEdit, onDelete }: ChildRowProps) {
  const g = genderLabel(child.gender);
  const d = formatDate(child.birthDate);
  return (
    <div className="flex items-center h-12 px-4 rounded-md bg-gray-50">
      <span className="flex-1 text-sm text-gray-800 truncate">
        {g ? <span className="text-gray-500 mr-2">{g}</span> : null}
        {child.name}
        {d ? <span className="text-gray-500 ml-1">({d})</span> : null}
      </span>
      <div className="flex items-center gap-1">
        <IconButton
          label="자녀 정보 편집"
          onClick={onEdit}
          className="w-9 h-9 text-gray-700"
        >
          <PencilIcon size={18} />
        </IconButton>
        <IconButton
          label="자녀 삭제"
          onClick={onDelete}
          className="w-9 h-9 text-gray-700"
        >
          <TrashIcon size={18} />
        </IconButton>
      </div>
    </div>
  );
}
