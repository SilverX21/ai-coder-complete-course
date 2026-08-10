"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ReactNode } from "react";
import { useBoard } from "./BoardProvider";
import { Card } from "./Card";
import { useView } from "./ViewContext";

function ListSection({
  columnId,
  title,
  cardIds,
  children,
}: {
  columnId: string;
  title: string;
  cardIds: string[];
  children: ReactNode;
}) {
  const { density } = useView();
  const compact = density === "compact";
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { type: "column", columnId },
  });

  return (
    <section
      data-testid={`list-section-${columnId}`}
      className={`rounded-2xl border border-white/60 bg-white/55 backdrop-blur-sm transition-colors duration-200 ${
        compact ? "p-2.5" : "p-4"
      } ${isOver ? "bg-[var(--blue-primary)]/10" : ""}`}>
      <h2
        className={`mb-3 flex items-center gap-2 border-b border-[var(--accent-yellow)]/40 pb-2 font-[family-name:var(--font-display)] font-semibold text-[var(--dark-navy)] ${
          compact ? "text-sm" : "text-base"
        }`}>
        <span className="h-2 w-2 rounded-full bg-[var(--blue-primary)]" />
        {title}
        <span className="ml-auto text-xs font-medium text-[var(--gray-text)]">{cardIds.length}</span>
      </h2>
      <div
        ref={setNodeRef}
        data-testid={`column-drop-${columnId}`}
        className={`flex min-h-[48px] flex-col ${compact ? "gap-1.5" : "gap-2.5"}`}>
        <SortableContext
          items={cardIds}
          strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>
    </section>
  );
}

export function ListView() {
  const { board } = useBoard();
  const { density } = useView();
  const compact = density === "compact";

  return (
    <div
      data-testid="view-list"
      className={`view-transition flex min-h-0 flex-1 flex-col overflow-y-auto pb-4 ${compact ? "gap-3" : "gap-4"}`}>
      {board.columns.map((column) => (
        <ListSection
          key={column.id}
          columnId={column.id}
          title={column.title}
          cardIds={column.cards.map((c) => c.id)}>
          {column.cards.map((card) => (
            <Card
              key={card.id}
              card={card}
            />
          ))}
        </ListSection>
      ))}
    </div>
  );
}
