"use client";

import type { Card as CardType } from "@/lib/types";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { useBoard } from "./BoardProvider";
import { CardPreview } from "./Card";
import { Column } from "./Column";
import { ListView } from "./ListView";
import { ViewProvider, type Density, type ViewMode } from "./ViewContext";
import { ViewToolbar } from "./ViewToolbar";

function findColumnIdByCardId(columns: { id: string; cards: { id: string }[] }[], cardId: string): string | null {
  for (const column of columns) {
    if (column.cards.some((c) => c.id === cardId)) {
      return column.id;
    }
  }
  return null;
}

export function Board() {
  const { board, relocateCard } = useBoard();
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [density, setDensity] = useState<Density>("comfortable");
  // Avoid SSR mismatch from @dnd-kit auto-generated aria IDs
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const fromColumnId = findColumnIdByCardId(board.columns, String(active.id));
    if (!fromColumnId) return;
    const column = board.columns.find((c) => c.id === fromColumnId);
    const card = column?.cards.find((c) => c.id === active.id);
    setActiveCard(card ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeColumnId = findColumnIdByCardId(board.columns, activeId);
    let overColumnId = findColumnIdByCardId(board.columns, overId);

    if (board.columns.some((c) => c.id === overId)) {
      overColumnId = overId;
    }

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return;
    }

    const overColumn = board.columns.find((c) => c.id === overColumnId);
    if (!overColumn) return;

    const overIndex = overColumn.cards.findIndex((c) => c.id === overId);
    const insertIndex = overIndex >= 0 ? overIndex : overColumn.cards.length;

    relocateCard(activeId, overColumnId, insertIndex);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeColumnId = findColumnIdByCardId(board.columns, activeId);
    let overColumnId = findColumnIdByCardId(board.columns, overId);

    if (board.columns.some((c) => c.id === overId)) {
      overColumnId = overId;
    }

    if (!activeColumnId || !overColumnId) return;

    const overColumn = board.columns.find((c) => c.id === overColumnId);
    if (!overColumn) return;

    if (activeColumnId === overColumnId) {
      const oldIndex = overColumn.cards.findIndex((c) => c.id === activeId);
      const newIndex = overColumn.cards.findIndex((c) => c.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        relocateCard(activeId, overColumnId, newIndex);
      }
      return;
    }

    const overIndex = overColumn.cards.findIndex((c) => c.id === overId);
    const insertIndex = overIndex >= 0 ? overIndex : overColumn.cards.length;
    relocateCard(activeId, overColumnId, insertIndex);
  }

  return (
    <ViewProvider value={{ viewMode, density }}>
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="mb-4 shrink-0 px-1">
          <p className="mb-1 text-xs font-semibold tracking-[0.18em] text-[var(--blue-primary)] uppercase">Kanban</p>
          <h1
            data-testid="board-title"
            className="board-title font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--dark-navy)] sm:text-4xl">
            {board.title}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--gray-text)]">One board. Five columns. Move work with intent.</p>
        </header>

        <ViewToolbar
          viewMode={viewMode}
          density={density}
          onViewMode={setViewMode}
          onDensity={setDensity}
        />

        <div
          data-testid={density === "compact" ? "density-compact" : "density-comfortable"}
          className="flex min-h-0 flex-1 flex-col">
          {!mounted ? (
            <div
              data-testid="view-board"
              className="flex min-h-0 flex-1 items-start justify-center pb-4 pt-8 text-sm text-[var(--gray-text)]">
              Loading board…
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}>
              {viewMode === "list" ? (
                <ListView />
              ) : (
                <div
                  data-testid="view-board"
                  className="view-transition flex min-h-0 flex-1 flex-row gap-4 overflow-x-auto pb-4">
                  {board.columns.map((column, index) => (
                    <Column
                      key={column.id}
                      column={column}
                      index={index}
                    />
                  ))}
                </div>
              )}
              <DragOverlay dropAnimation={null}>{activeCard ? <CardPreview card={activeCard} /> : null}</DragOverlay>
            </DndContext>
          )}
        </div>
      </div>
    </ViewProvider>
  );
}
