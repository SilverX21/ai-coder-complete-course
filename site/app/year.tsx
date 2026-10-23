"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// The page is prerendered at build time, so a server-side year goes stale after New Year.
// Hydrate with the build year (server and client match), then show the visitor's current year.
export function Year({ built }: { built: number }) {
  const year = useSyncExternalStore(subscribe, () => new Date().getFullYear(), () => built);
  return <>{year}</>;
}
