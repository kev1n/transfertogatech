"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/**
 * Returns true when the resolved theme is dark. Returns false during SSR
 * and the brief pre-mount window (so first paint matches server output).
 */
export function useIsDark(): boolean {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && resolvedTheme === "dark";
}
