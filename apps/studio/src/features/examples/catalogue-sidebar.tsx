"use client";
import { useMemo, useRef, useState } from "react";
import {
  CATEGORIES,
  STYLE_FILTERS,
  listCatalogue,
  resolveExample,
  searchExamples,
} from "./catalogue";
import type { CategoryId, StyleId } from "./catalogue";

export function CatalogueSidebar({
  category,
  onCategory,
  selected,
  onSelect,
  disabled,
}: {
  readonly category: CategoryId | undefined;
  readonly onCategory: (category: CategoryId | undefined) => void;
  readonly selected: string | undefined;
  readonly onSelect: (id: string) => void;
  readonly disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState<StyleId | "all">("all");
  const [feature, setFeature] = useState("all");
  const [open, setOpen] = useState(false);
  const drawerButton = useRef<HTMLButtonElement>(null);
  const examples = useMemo(
    () =>
      searchExamples(
        query,
        category,
        style === "all" ? undefined : style,
      ).filter((entry) => {
        if (feature === "all") return true;
        const resolved = resolveExample({ exampleId: entry.id });
        return (
          resolved.ok &&
          resolved.capabilities.controls[
            feature === "motion" ? "motion" : "namedFields"
          ].status !== "unavailable"
        );
      }),
    [query, category, style, feature],
  );
  const families = [...new Set(examples.map((item) => item.family))];
  const select = (id: string) => {
    onSelect(id);
    setOpen(false);
    if (open) drawerButton.current?.focus();
  };
  return (
    <aside
      className="catalogue-sidebar"
      data-open={open}
      aria-label="Example catalogue"
    >
      <button
        ref={drawerButton}
        className="catalogue-drawer-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="catalogue-discovery"
        onClick={() => setOpen((value) => !value)}
      >
        Browse examples <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div
        id="catalogue-discovery"
        className="catalogue-discovery"
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.preventDefault();
            setOpen(false);
            drawerButton.current?.focus();
          }
        }}
      >
        <p className="eyebrow">Find your starting point</p>
        <label>
          Search examples
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, style or purpose"
          />
        </label>
        <nav className="category-navigation" aria-label="Example categories">
          <button
            type="button"
            aria-current={!category ? "page" : undefined}
            onClick={() => onCategory(undefined)}
          >
            All examples <span>{listCatalogue().examples.length}</span>
          </button>
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={item.id === category ? "page" : undefined}
              onClick={() => onCategory(item.id)}
            >
              {item.name}
              <span>
                {
                  listCatalogue().examples.filter(
                    (entry) => entry.category === item.id,
                  ).length
                }
              </span>
            </button>
          ))}
        </nav>
        <label>
          Visual style
          <select
            value={style}
            onChange={(event) =>
              setStyle(event.target.value as StyleId | "all")
            }
          >
            <option value="all">Any style</option>
            {STYLE_FILTERS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Supported features
          <select
            value={feature}
            onChange={(event) => setFeature(event.target.value)}
          >
            <option value="all">Any feature set</option>
            <option value="motion">Motion available</option>
            <option value="fields">Named fields</option>
          </select>
        </label>
        <p className="catalogue-count" role="status">
          {examples.length} examples{query ? ` matching “${query}”` : ""}
        </p>
        <div className="catalogue-families">
          {families.map((family) => {
            const variants = examples.filter((item) => item.family === family);
            return (
              <details
                key={family}
                open={query ? true : undefined}
                className="catalogue-family"
              >
                <summary>
                  {family}
                  <span>
                    {variants.length > 1
                      ? `${variants.length} variants`
                      : "1 example"}
                  </span>
                </summary>
                {variants.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    disabled={disabled}
                    aria-current={item.id === selected ? "true" : undefined}
                    onClick={() => select(item.id)}
                  >
                    <span>{item.name}</span>
                    <small>{item.purpose}</small>
                  </button>
                ))}
              </details>
            );
          })}
          {!examples.length && (
            <p>
              No examples match. Clear the search or change the category, style
              or feature filter.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
