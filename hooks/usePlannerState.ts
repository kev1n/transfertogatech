"use client";

import { useCallback, useEffect, useState } from "react";
import { decodeShare, encodeShare, SharePayload } from "@/lib/share/encode";
import type { Pick, PicksMap } from "@/lib/planner/picks";

const EMPTY: SharePayload = {
  school: { value: "", label: "" },
  major: { value: "", label: "" },
  picks: {},
};

/**
 * The planner's full state, hydrated from `?s=` on first load.
 * Mutations go through stable callbacks; the share URL is recomputed
 * (but not auto-applied to the address bar — that lives in `getShareUrl`).
 */
export function usePlannerState() {
  const [state, setState] = useState<SharePayload>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shareParam = new URLSearchParams(window.location.search).get("s");
    if (shareParam) {
      const decoded = decodeShare(shareParam);
      if (decoded) setState(decoded);
    }
    setHydrated(true);
  }, []);

  const setSchool = useCallback(
    (school: { value: string; label: string }) =>
      setState((prev) => ({ ...prev, school, picks: {} })),
    []
  );

  const setMajor = useCallback(
    (major: { value: string; label: string }) =>
      setState((prev) => ({ ...prev, major })),
    []
  );

  const setPick = useCallback((slotKey: string, pick: Pick) => {
    setState((prev) => ({
      ...prev,
      picks: { ...prev.picks, [slotKey]: pick },
    }));
  }, []);

  const clearPick = useCallback((slotKey: string) => {
    setState((prev) => {
      const next: PicksMap = { ...prev.picks };
      delete next[slotKey];
      return { ...prev, picks: next };
    });
  }, []);

  const getShareUrl = useCallback((): string => {
    if (typeof window === "undefined") return "";
    const param = encodeShare(state);
    const url = new URL(window.location.href);
    url.search = `?s=${param}`;
    url.hash = "";
    return url.toString();
  }, [state]);

  return {
    school: state.school,
    major: state.major,
    picks: state.picks,
    hydrated,
    setSchool,
    setMajor,
    setPick,
    clearPick,
    getShareUrl,
  };
}
