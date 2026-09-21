"use client";

import { useSyncExternalStore } from "react";

import { utcLabel } from "@/lib/listings";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` while rendering on the server, `true` once hydrated in the browser.
 *
 * `useSyncExternalStore` gives us a client-only value without calling setState
 * inside an effect, so the server snapshot and the first client render agree.
 */
function useHasHydrated() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

/**
 * Renders an absolute timestamp in the visitor's own timezone.
 *
 * Until hydration completes it shows a deterministic UTC label, which keeps the
 * markup stable and avoids a hydration mismatch.
 */
export function LocalTime({
  iso,
  className,
}: {
  iso: string;
  className?: string;
}) {
  const hydrated = useHasHydrated();
  const date = new Date(iso);
  const valid = !Number.isNaN(date.getTime());

  return (
    <time dateTime={iso} className={className}>
      {valid && hydrated
        ? date.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : utcLabel(iso)}
    </time>
  );
}