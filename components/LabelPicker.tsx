"use client";

import { Check } from "lucide-react";

export function LabelPicker({
  labels,
  selected,
  onChange,
}: {
  labels: string[];
  selected: string[];
  onChange: (labels: string[]) => void;
}) {
  function toggle(label: string) {
    if (selected.includes(label)) {
      onChange(selected.filter((item) => item !== label));
      return;
    }
    onChange([...selected, label]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => {
        const active = selected.includes(label);
        return (
          <button
            key={label}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "border-lume-primary/30 bg-[#F4F4F2] text-lume-primary"
                : "border-lume-border bg-[#FAFAFA] text-lume-muted hover:border-lume-primary/30 hover:text-lume-primary"
            }`}
            type="button"
            onClick={() => toggle(label)}
          >
            {active ? <Check className="h-3 w-3" /> : null}
            {label}
          </button>
        );
      })}
      {!labels.length ? (
        <div className="rounded-xl border border-dashed border-lume-border bg-[#FAFAFA] px-3 py-2 text-xs font-medium text-lume-muted">
          Add labels from the sidebar first.
        </div>
      ) : null}
    </div>
  );
}
