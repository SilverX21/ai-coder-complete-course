"use client";

import type { Column as ColumnType } from "@/lib/types";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState, type KeyboardEvent } from "react";
import { AddCardForm } from "./AddCardForm";
import { useBoard } from "./BoardProvider";
import { Card } from "./Card";
import { useView } from "./ViewContext";

type ColumnProps = {
  column: ColumnType;
  index: number;
};

export function Column({ column, index }: ColumnProps) {
  const { renameColumnTitle } = useBoard();
  const { density } = useView();
  const compact = density === "compact";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(column.title);
  const [adding, setAdding] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });

  function commitRename() {
    const next = draft.trim();
    if (next && next !== column.title) {
      renameColumnTitle(column.id, next);
    } else {
      setDraft(column.title);
    }
    setEditing(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      commitRename();
    }
    if (e.key === "Escape") {
      setDraft(column.title);
      setEditing(false);
    }
  }

  return (
    <section
      data-testid={`column-${column.id}`}
      className={`column-enter flex w-[280px] shrink-0 flex-col rounded-2xl border border-white/60 bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_30px_rgba(3,33,71,0.06)] backdrop-blur-sm transition-[padding] duration-300 ${
        compact ? "p-2" : "p-3"
      }`}
      style={{ animationDelay: `${index * 70}ms` }}>
      <header
        className={`flex items-center gap-2 border-b border-[var(--accent-yellow)]/40 ${
          compact ? "mb-2 pb-1.5" : "mb-3 pb-2.5"
        }`}>
        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--blue-primary)]" />
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={onKeyDown}
            aria-label="Column title"
            data-testid={`column-title-input-${column.id}`}
            className="w-full rounded-md border border-[var(--blue-primary)]/40 bg-white px-2 py-1 font-[family-name:var(--font-display)] text-base font-semibold text-[var(--dark-navy)] outline-none ring-2 ring-[var(--blue-primary)]/30"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(column.title);
              setEditing(true);
            }}
            data-testid={`column-title-${column.id}`}
            className={`flex-1 truncate text-left font-[family-name:var(--font-display)] font-semibold text-[var(--dark-navy)] transition hover:text-[var(--blue-primary)] ${
              compact ? "text-sm" : "text-base"
            }`}>
            {column.title}
          </button>
        )}
        <span className="rounded-md bg-[var(--dark-navy)]/5 px-1.5 py-0.5 text-xs font-medium text-[var(--gray-text)]">
          {column.cards.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        data-testid={`column-drop-${column.id}`}
        className={`flex min-h-[80px] flex-1 flex-col rounded-xl p-1 transition-colors duration-200 ${
          compact ? "gap-1.5" : "gap-2.5"
        } ${isOver ? "bg-[var(--blue-primary)]/10" : ""}`}>
        <SortableContext
          items={column.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <Card
              key={card.id}
              card={card}
            />
          ))}
        </SortableContext>
      </div>

      <div className={compact ? "mt-2" : "mt-3"}>
        {adding ? (
          <AddCardForm
            columnId={column.id}
            onClose={() => setAdding(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            data-testid={`add-card-btn-${column.id}`}
            className={`w-full rounded-lg border border-dashed border-[var(--dark-navy)]/15 text-left text-[var(--gray-text)] transition hover:border-[var(--purple-secondary)]/40 hover:bg-white/70 hover:text-[var(--purple-secondary)] ${
              compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"
            }`}>
            + Add card
          </button>
        )}
      </div>
    </section>
  );
}
