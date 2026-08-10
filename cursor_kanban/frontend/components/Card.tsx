"use client";

import type { Card as CardType } from "@/lib/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useEffect,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useBoard } from "./BoardProvider";
import { useView } from "./ViewContext";

type CardProps = {
  card: CardType;
};

function CardShell({
  card,
  children,
  className,
  style,
  innerRef,
  ...dragProps
}: {
  card: CardType;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  innerRef?: (node: HTMLElement | null) => void;
} & Record<string, unknown>) {
  const { density } = useView();
  const compact = density === "compact";

  return (
    <article
      ref={innerRef}
      style={style}
      data-testid={`card-${card.id}`}
      className={`card-enter group relative rounded-xl border border-white/80 bg-white shadow-[0_1px_2px_rgba(3,33,71,0.06),0_8px_24px_rgba(3,33,71,0.04)] transition-[box-shadow,opacity,transform,padding] duration-200 ${
        compact ? "p-2.5" : "p-3.5"
      } ${className ?? ""}`}
      {...dragProps}>
      {children}
    </article>
  );
}

export function Card({ card }: CardProps) {
  const { removeCard, updateCardFields } = useBoard();
  const { density } = useView();
  const compact = density === "compact";
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [details, setDetails] = useState(card.details);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", card },
    disabled: editing,
  });

  useEffect(() => {
    if (!editing) {
      setTitle(card.title);
      setDetails(card.details);
    }
  }, [card.title, card.details, editing]);

  function startEdit(e: MouseEvent) {
    e.stopPropagation();
    setConfirmDelete(false);
    setTitle(card.title);
    setDetails(card.details);
    setEditing(true);
  }

  function cancelEdit() {
    setTitle(card.title);
    setDetails(card.details);
    setEditing(false);
  }

  function saveEdit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    updateCardFields(card.id, trimmed, details.trim());
    setEditing(false);
  }

  function onEditKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      cancelEdit();
    }
  }

  function requestDelete(e: MouseEvent) {
    e.stopPropagation();
    setEditing(false);
    setConfirmDelete(true);
  }

  function cancelDelete(e: MouseEvent) {
    e.stopPropagation();
    setConfirmDelete(false);
  }

  function confirmRemove(e: MouseEvent) {
    e.stopPropagation();
    removeCard(card.id);
  }

  if (editing) {
    return (
      <CardShell
        card={card}
        className="ring-2 ring-[var(--blue-primary)]/30">
        <form
          onSubmit={saveEdit}
          onKeyDown={onEditKeyDown}
          data-testid={`edit-card-form-${card.id}`}
          className="animate-fade-in space-y-2"
          onPointerDown={(e) => e.stopPropagation()}>
          <input
            autoFocus
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Card title"
            data-testid={`edit-card-title-${card.id}`}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[var(--dark-navy)] outline-none ring-[var(--blue-primary)] focus:ring-2"
          />
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            aria-label="Card details"
            rows={compact ? 2 : 3}
            data-testid={`edit-card-details-${card.id}`}
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[var(--dark-navy)] outline-none ring-[var(--blue-primary)] focus:ring-2"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              data-testid={`save-card-${card.id}`}
              className="rounded-lg bg-[var(--purple-secondary)] px-3 py-1.5 text-sm font-medium text-white transition hover:brightness-110">
              Save
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg px-3 py-1.5 text-sm text-[var(--gray-text)] hover:bg-slate-100">
              Cancel
            </button>
          </div>
        </form>
      </CardShell>
    );
  }

  return (
    <CardShell
      card={card}
      innerRef={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={isDragging ? "opacity-30" : "hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(3,33,71,0.1)]"}
      {...attributes}
      {...listeners}>
      <div className={`mb-1.5 flex items-start justify-between gap-2 ${compact ? "mb-1" : ""}`}>
        <h3
          className={`font-[family-name:var(--font-display)] font-semibold leading-snug text-[var(--dark-navy)] ${
            compact ? "text-sm" : "text-[0.95rem]"
          }`}>
          {card.title}
        </h3>
        <div
          className="flex shrink-0 items-center gap-0.5"
          onPointerDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            aria-label={`Edit ${card.title}`}
            data-testid={`edit-card-${card.id}`}
            className="rounded-md px-1.5 py-0.5 text-xs text-[var(--gray-text)] opacity-60 transition hover:bg-[var(--blue-primary)]/10 hover:text-[var(--blue-primary)] hover:opacity-100 group-hover:opacity-100"
            onClick={startEdit}>
            Edit
          </button>
          <button
            type="button"
            aria-label={`Delete ${card.title}`}
            data-testid={`delete-card-${card.id}`}
            className="rounded-md px-1.5 py-0.5 text-sm text-[var(--gray-text)] opacity-60 transition hover:bg-red-50 hover:text-red-600 hover:opacity-100 group-hover:opacity-100"
            onClick={requestDelete}>
            ×
          </button>
        </div>
      </div>
      {card.details ? (
        <p className={`leading-relaxed text-[var(--gray-text)] ${compact ? "text-xs" : "text-sm"}`}>{card.details}</p>
      ) : null}

      {confirmDelete ? (
        <div
          data-testid={`confirm-delete-${card.id}`}
          className="confirm-strip mt-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/90 px-2 py-1.5"
          onPointerDown={(e) => e.stopPropagation()}>
          <span className="flex-1 text-xs font-medium text-red-700">Delete?</span>
          <button
            type="button"
            data-testid={`confirm-delete-btn-${card.id}`}
            className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-red-700"
            onClick={confirmRemove}>
            Confirm
          </button>
          <button
            type="button"
            data-testid={`cancel-delete-btn-${card.id}`}
            className="rounded-md px-2 py-1 text-xs text-[var(--gray-text)] hover:bg-white"
            onClick={cancelDelete}>
            Cancel
          </button>
        </div>
      ) : null}
    </CardShell>
  );
}

export function CardPreview({ card }: { card: CardType }) {
  const { density } = useView();
  const compact = density === "compact";

  return (
    <article
      data-testid={`card-${card.id}`}
      className={`rounded-xl border border-white/80 bg-white shadow-[0_12px_40px_rgba(3,33,71,0.18)] ring-2 ring-[var(--accent-yellow)] rotate-1 scale-[1.02] ${
        compact ? "p-2.5" : "p-3.5"
      }`}>
      <h3
        className={`font-[family-name:var(--font-display)] font-semibold leading-snug text-[var(--dark-navy)] ${
          compact ? "text-sm" : "text-[0.95rem]"
        }`}>
        {card.title}
      </h3>
      {card.details ? (
        <p className={`mt-1 leading-relaxed text-[var(--gray-text)] ${compact ? "text-xs" : "text-sm"}`}>{card.details}</p>
      ) : null}
    </article>
  );
}
