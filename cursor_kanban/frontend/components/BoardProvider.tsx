"use client";

import { addCard, deleteCard, moveCard, renameColumn, updateCard } from "@/lib/board-ops";
import { seedBoard } from "@/lib/seed";
import type { Board } from "@/lib/types";
import { createContext, useContext, useState, type ReactNode } from "react";

type BoardContextValue = {
  board: Board;
  renameColumnTitle: (columnId: string, title: string) => void;
  addCardToColumn: (columnId: string, title: string, details: string) => void;
  updateCardFields: (cardId: string, title: string, details: string) => void;
  removeCard: (cardId: string) => void;
  relocateCard: (cardId: string, toColumnId: string, toIndex: number) => void;
};

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [board, setBoard] = useState<Board>(seedBoard);

  const value: BoardContextValue = {
    board,
    renameColumnTitle: (columnId, title) => {
      setBoard((prev) => renameColumn(prev, columnId, title));
    },
    addCardToColumn: (columnId, title, details) => {
      setBoard((prev) => addCard(prev, columnId, { title, details }));
    },
    updateCardFields: (cardId, title, details) => {
      setBoard((prev) => updateCard(prev, cardId, { title, details }));
    },
    removeCard: (cardId) => {
      setBoard((prev) => deleteCard(prev, cardId));
    },
    relocateCard: (cardId, toColumnId, toIndex) => {
      setBoard((prev) => moveCard(prev, cardId, toColumnId, toIndex));
    },
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoard() {
  const ctx = useContext(BoardContext);
  if (!ctx) {
    throw new Error("useBoard must be used within BoardProvider");
  }
  return ctx;
}
