/** amicro copy/check treatment driven solely by the owning clipboard result. */
export function CopyMark({ copied }: { readonly copied: boolean }) {
  return (
    <span className="micro-copy-mark" data-copied={copied} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <g className="micro-copy-glyph">
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M15 5V4H4v11h1" />
        </g>
        <path className="micro-check-glyph" d="m4 12 5 5 11-11" />
      </svg>
    </span>
  );
}
