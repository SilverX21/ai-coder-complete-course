import type { Board, Card, Column } from "./types";

export function renameColumn(board: Board, columnId: string, title: string): Board {
  return {
    ...board,
    columns: board.columns.map((column) => (column.id === columnId ? { ...column, title } : column)),
  };
}

export function addCard(board: Board, columnId: string, card: Omit<Card, "id"> & { id?: string }): Board {
  const newCard: Card = {
    id: card.id ?? crypto.randomUUID(),
    title: card.title,
    details: card.details,
  };

  return {
    ...board,
    columns: board.columns.map((column) =>
      column.id === columnId ? { ...column, cards: [...column.cards, newCard] } : column,
    ),
  };
}

export function deleteCard(board: Board, cardId: string): Board {
  return {
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.filter((card) => card.id !== cardId),
    })),
  };
}

export function updateCard(board: Board, cardId: string, fields: { title: string; details: string }): Board {
  return {
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.map((card) =>
        card.id === cardId ? { ...card, title: fields.title, details: fields.details } : card,
      ),
    })),
  };
}

function findColumnIndex(board: Board, columnId: string): number {
  return board.columns.findIndex((column) => column.id === columnId);
}

function findCardLocation(board: Board, cardId: string): { columnIndex: number; cardIndex: number } | null {
  for (let columnIndex = 0; columnIndex < board.columns.length; columnIndex++) {
    const cardIndex = board.columns[columnIndex].cards.findIndex((card) => card.id === cardId);
    if (cardIndex !== -1) {
      return { columnIndex, cardIndex };
    }
  }
  return null;
}

/** Move a card to a target column at a given index (supports empty columns). */
export function moveCard(board: Board, cardId: string, toColumnId: string, toIndex: number): Board {
  const from = findCardLocation(board, cardId);
  const toColumnIndex = findColumnIndex(board, toColumnId);

  if (!from || toColumnIndex === -1) {
    return board;
  }

  const columns: Column[] = board.columns.map((column) => ({
    ...column,
    cards: [...column.cards],
  }));

  const [card] = columns[from.columnIndex].cards.splice(from.cardIndex, 1);

  let insertIndex = toIndex;
  if (from.columnIndex === toColumnIndex && from.cardIndex < toIndex) {
    insertIndex = toIndex - 1;
  }
  insertIndex = Math.max(0, Math.min(insertIndex, columns[toColumnIndex].cards.length));

  columns[toColumnIndex].cards.splice(insertIndex, 0, card);

  return { ...board, columns };
}
