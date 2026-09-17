import type { SVGProps } from "react";

/**
 * Food Bridge mark: two arcs bridging over a plate, with a leaf growing off the
 * deck. Drawn as plain SVG so it inherits `currentColor` and needs no assets.
 */
export function BridgeMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <circle cx="24" cy="24" r="23" fill="currentColor" opacity="0.12" />
      <path
        d="M6 32c0-9.941 8.059-18 18-18s18 8.059 18 18"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M13.5 32c0-5.799 4.701-10.5 10.5-10.5S34.5 26.201 34.5 32"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path d="M4 32h40" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path
        d="M24 13.5c0-3.5 2.5-6 5.5-6.5-.5 3.5-2 6-5.5 6.5Z"
        fill="currentColor"
        opacity="0.75"
      />
      <path d="M24 13.5V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}
