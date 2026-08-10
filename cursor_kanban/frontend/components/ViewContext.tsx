"use client";

import { createContext, useContext, type ReactNode } from "react";

export type ViewMode = "board" | "list";
export type Density = "comfortable" | "compact";

type ViewContextValue = {
  viewMode: ViewMode;
  density: Density;
};

const ViewContext = createContext<ViewContextValue>({
  viewMode: "board",
  density: "comfortable",
});

export function ViewProvider({ value, children }: { value: ViewContextValue; children: ReactNode }) {
  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
}

export function useView() {
  return useContext(ViewContext);
}
