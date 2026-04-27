"use client";

import { useCallback, useEffect, useState } from "react";
import { decodeShare, encodeShare, SharePayload } from "@/lib/share/encode";
import type { Pick, PicksMap } from "@/lib/planner/picks";

const EMPTY: SharePayload = {
  school: { value: "", label: "" },
  major: { value: "", label: "" },
  picks: {},
};

const STORAGE_KEY = "transfertogatech:planner-v1";

function readLocal(): SharePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SharePayload;
    if (!parsed?.school || !parsed?.major || !parsed?.picks) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeLocal(state: SharePayload): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded / privacy mode — silently no-op.
  }
}

/**
 * Planner state.
 *
 * Hydration on first load:
 *   - `?s=` URL param → load shared plan in **read-only mode**. localStorage
 *     is never touched; setters are no-ops; the user can view but not edit.
 *   - localStorage   → load saved plan, full read/write.
 *   - neither        → EMPTY, full read/write.
 *
 * Read-only mode dramatically simplifies share-link UX: there's no conflict
 * to resolve, no risk of overwriting your own plan, and no surprise
 * persistence. Call `exitSharedView()` to drop the URL param and return to
 * the saved local plan.
 */
export function usePlannerState() {
  const [state, setState] = useState<SharePayload>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shareParam = new URLSearchParams(window.location.search).get("s");
    const sharedDecoded = shareParam ? decodeShare(shareParam) : null;
    if (sharedDecoded) {
      setState(sharedDecoded);
      setReadOnly(true);
    } else {
      const local = readLocal();
      if (local) setState(local);
    }
    setHydrated(true);
  }, []);

  // Persist on every change after hydration, ONLY when not in read-only mode.
  useEffect(() => {
    if (!hydrated || readOnly) return;
    writeLocal(state);
  }, [hydrated, readOnly, state]);

  const setSchool = useCallback(
    (school: { value: string; label: string }) => {
      if (readOnly) return;
      setState((prev) => ({ ...prev, school, picks: {} }));
    },
    [readOnly]
  );

  const setMajor = useCallback(
    (major: { value: string; label: string }) => {
      if (readOnly) return;
      setState((prev) => ({ ...prev, major }));
    },
    [readOnly]
  );

  const setPick = useCallback(
    (slotKey: string, pick: Pick) => {
      if (readOnly) return;
      setState((prev) => ({
        ...prev,
        picks: { ...prev.picks, [slotKey]: pick },
      }));
    },
    [readOnly]
  );

  const clearPick = useCallback(
    (slotKey: string) => {
      if (readOnly) return;
      setState((prev) => {
        const next: PicksMap = { ...prev.picks };
        delete next[slotKey];
        return { ...prev, picks: next };
      });
    },
    [readOnly]
  );

  /** Drops the `?s=` param and reloads the saved local plan. */
  const exitSharedView = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete("s");
    window.history.replaceState({}, "", url.toString());
    const local = readLocal();
    setState(local ?? EMPTY);
    setReadOnly(false);
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
    readOnly,
    setSchool,
    setMajor,
    setPick,
    clearPick,
    exitSharedView,
    getShareUrl,
  };
}
