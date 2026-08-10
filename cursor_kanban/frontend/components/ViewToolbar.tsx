"use client";

import type { Density, ViewMode } from "./ViewContext";

type SegmentOption<T extends string> = {
  value: T;
  label: string;
  testId: string;
};

function SegmentGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  testId,
}: {
  label: string;
  value: T;
  options: SegmentOption<T>[];
  onChange: (next: T) => void;
  testId: string;
}) {
  return (
    <div
      data-testid={testId}
      className="flex flex-col gap-1">
      <span className="text-[0.65rem] font-semibold tracking-[0.12em] text-[var(--gray-text)] uppercase">{label}</span>
      <div className="inline-flex rounded-lg border border-[var(--dark-navy)]/10 bg-white/70 p-0.5 shadow-sm backdrop-blur-sm">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              data-testid={option.testId}
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                active
                  ? "bg-[var(--purple-secondary)] text-white shadow-sm"
                  : "text-[var(--dark-navy)] hover:bg-[var(--dark-navy)]/5"
              }`}>
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type ViewToolbarProps = {
  viewMode: ViewMode;
  density: Density;
  onViewMode: (mode: ViewMode) => void;
  onDensity: (density: Density) => void;
};

export function ViewToolbar({ viewMode, density, onViewMode, onDensity }: ViewToolbarProps) {
  return (
    <div
      data-testid="view-toolbar"
      className="mb-5 flex flex-wrap items-end gap-4">
      <SegmentGroup
        label="Layout"
        testId="control-view-mode"
        value={viewMode}
        onChange={onViewMode}
        options={[
          { value: "board", label: "Board", testId: "toggle-view-board" },
          { value: "list", label: "List", testId: "toggle-view-list" },
        ]}
      />
      <SegmentGroup
        label="Density"
        testId="control-density"
        value={density}
        onChange={onDensity}
        options={[
          {
            value: "comfortable",
            label: "Comfortable",
            testId: "toggle-density-comfortable",
          },
          {
            value: "compact",
            label: "Compact",
            testId: "toggle-density-compact",
          },
        ]}
      />
    </div>
  );
}
