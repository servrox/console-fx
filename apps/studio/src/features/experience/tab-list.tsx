"use client";
import { useRef } from "react";

/** amicro-inspired selected treatment; visible labels and native keyboard semantics. */
export function TabList<T extends string>({
  id,
  label,
  items,
  value,
  onChange,
  className = "",
  disabled = false,
}: {
  readonly id: string;
  readonly label: string;
  readonly items: readonly { readonly id: T; readonly name: string }[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly className?: string;
  readonly disabled?: boolean;
}) {
  const buttons = useRef(new Map<T, HTMLButtonElement>());
  return (
    <div
      role="tablist"
      aria-label={label}
      className={`micro-tabs ${className}`}
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          disabled={disabled}
          role="tab"
          id={`${id}-tab-${item.id}`}
          aria-controls={`${id}-panel-${item.id}`}
          aria-selected={item.id === value}
          tabIndex={item.id === value ? 0 : -1}
          ref={(element) => {
            if (element) buttons.current.set(item.id, element);
            else buttons.current.delete(item.id);
          }}
          onClick={() => onChange(item.id)}
          onKeyDown={(event) => {
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? items.length - 1
                  : event.key === "ArrowRight"
                    ? (index + 1) % items.length
                    : event.key === "ArrowLeft"
                      ? (index + items.length - 1) % items.length
                      : null;
            if (next === null) return;
            event.preventDefault();
            const target = items[next]!;
            onChange(target.id);
            buttons.current.get(target.id)?.focus();
          }}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}
