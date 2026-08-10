"use client";

import { useState, type FormEvent } from "react";
import { useBoard } from "./BoardProvider";

type AddCardFormProps = {
  columnId: string;
  onClose: () => void;
};

export function AddCardForm({ columnId, onClose }: AddCardFormProps) {
  const { addCardToColumn } = useBoard();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    addCardToColumn(columnId, trimmed, details.trim());
    setTitle("");
    setDetails("");
    onClose();
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-testid={`add-card-form-${columnId}`}
      className="animate-fade-in space-y-2 rounded-xl border border-[var(--blue-primary)]/25 bg-white/90 p-3 shadow-sm">
      <input
        autoFocus
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Card title"
        aria-label="Card title"
        data-testid={`card-title-input-${columnId}`}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[var(--dark-navy)] outline-none ring-[var(--blue-primary)] placeholder:text-slate-400 focus:ring-2"
      />
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Details (optional)"
        aria-label="Card details"
        rows={2}
        data-testid={`card-details-input-${columnId}`}
        className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[var(--dark-navy)] outline-none ring-[var(--blue-primary)] placeholder:text-slate-400 focus:ring-2"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          data-testid={`submit-card-${columnId}`}
          className="rounded-lg bg-[var(--purple-secondary)] px-3 py-1.5 text-sm font-medium text-white transition hover:brightness-110 active:scale-[0.98]">
          Add card
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 text-sm text-[var(--gray-text)] hover:bg-slate-100">
          Cancel
        </button>
      </div>
    </form>
  );
}
