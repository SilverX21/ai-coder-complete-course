import { describe, expect, it } from "vitest";
import { addCard, deleteCard, moveCard, renameColumn, updateCard } from "./board-ops";
import type { Board } from "./types";

const sampleBoard: Board = {
  title: "Test",
  columns: [
    {
      id: "col-a",
      title: "A",
      cards: [
        { id: "c1", title: "One", details: "d1" },
        { id: "c2", title: "Two", details: "d2" },
      ],
    },
    {
      id: "col-b",
      title: "B",
      cards: [{ id: "c3", title: "Three", details: "d3" }],
    },
    {
      id: "col-c",
      title: "C",
      cards: [],
    },
  ],
};

describe("renameColumn", () => {
  it("renames the target column", () => {
    const next = renameColumn(sampleBoard, "col-b", "Ready");
    expect(next.columns[1].title).toBe("Ready");
    expect(next.columns[0].title).toBe("A");
  });
});

describe("addCard", () => {
  it("appends a card to the column", () => {
    const next = addCard(sampleBoard, "col-c", {
      id: "c4",
      title: "Four",
      details: "d4",
    });
    expect(next.columns[2].cards).toHaveLength(1);
    expect(next.columns[2].cards[0]).toEqual({
      id: "c4",
      title: "Four",
      details: "d4",
    });
  });
});

describe("deleteCard", () => {
  it("removes the card from its column", () => {
    const next = deleteCard(sampleBoard, "c2");
    expect(next.columns[0].cards.map((c) => c.id)).toEqual(["c1"]);
  });
});

describe("updateCard", () => {
  it("updates title and details on the target card", () => {
    const next = updateCard(sampleBoard, "c1", {
      title: "Updated",
      details: "new details",
    });
    expect(next.columns[0].cards[0]).toEqual({
      id: "c1",
      title: "Updated",
      details: "new details",
    });
    expect(next.columns[0].cards[1].title).toBe("Two");
  });
});

describe("moveCard", () => {
  it("reorders within the same column", () => {
    const next = moveCard(sampleBoard, "c1", "col-a", 2);
    expect(next.columns[0].cards.map((c) => c.id)).toEqual(["c2", "c1"]);
  });

  it("moves a card to another column", () => {
    const next = moveCard(sampleBoard, "c1", "col-b", 0);
    expect(next.columns[0].cards.map((c) => c.id)).toEqual(["c2"]);
    expect(next.columns[1].cards.map((c) => c.id)).toEqual(["c1", "c3"]);
  });

  it("moves a card into an empty column", () => {
    const next = moveCard(sampleBoard, "c3", "col-c", 0);
    expect(next.columns[1].cards).toHaveLength(0);
    expect(next.columns[2].cards.map((c) => c.id)).toEqual(["c3"]);
  });
});
