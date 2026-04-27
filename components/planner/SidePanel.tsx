"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PanelContent {
  title: string;
  subtitle?: string;
  body: React.ReactNode;
}

interface PanelContextValue {
  open: boolean;
  content: PanelContent | null;
  openPanel: (content: PanelContent) => void;
  closePanel: () => void;
}

const PanelContext = createContext<PanelContextValue>({
  open: false,
  content: null,
  openPanel: () => {},
  closePanel: () => {},
});

export function usePanel() {
  return useContext(PanelContext);
}

export function PanelProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<PanelContent | null>(null);
  const openPanel = useCallback((c: PanelContent) => setContent(c), []);
  const closePanel = useCallback(() => setContent(null), []);

  const value = useMemo<PanelContextValue>(
    () => ({ open: content !== null, content, openPanel, closePanel }),
    [content, openPanel, closePanel]
  );

  return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}

/**
 * Layout container that renders main content + side panel:
 *
 * Desktop (md+): `flex-row`. Main content shrinks to `flex-1`, panel
 *   slides in to `w-[480px]`, pushing not overlapping. The "+ Add"
 *   buttons in the main column remain accessible.
 * Mobile: panel is `fixed bottom-0` taking nearly full viewport with a
 *   small dismiss strip on top. Main column is unaffected by panel.
 */
export function PanelLayout({ children }: { children: React.ReactNode }) {
  const { open, content, closePanel } = usePanel();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <main
        className={cn(
          "flex-1 transition-all duration-300 ease-out",
          open && "md:mr-[480px]"
        )}
      >
        {children}
      </main>

      {/* Desktop: fixed-positioned side rail that pushes via main margin. */}
      <aside
        className={cn(
          "fixed top-0 right-0 hidden h-screen md:flex w-[480px] flex-col",
          "border-l border-warm bg-warm-surface shadow-2xl",
          "transition-transform duration-300 ease-out z-40",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
      >
        {content && <PanelChrome content={content} onClose={closePanel} />}
      </aside>

      {/* Mobile: dimmed backdrop above the panel — clickable to close. */}
      <button
        type="button"
        aria-label="Close panel"
        onClick={closePanel}
        className={cn(
          "fixed inset-0 z-30 bg-black/60 md:hidden transition-opacity duration-300",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      />

      {/* Mobile: bottom sheet — small dismiss strip on top. */}
      <aside
        className={cn(
          "fixed inset-x-0 bottom-0 top-12 md:hidden flex flex-col",
          "rounded-t-2xl border-t border-warm bg-warm-surface shadow-2xl",
          "transition-transform duration-300 ease-out z-40",
          open ? "translate-y-0" : "translate-y-full"
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          onClick={closePanel}
          className="flex h-8 w-full items-center justify-center text-ink-3 active:bg-warm-soft"
          aria-label="Close panel"
        >
          <span className="block h-1.5 w-12 rounded-full bg-warm-2" />
        </button>
        {content && <PanelChrome content={content} onClose={closePanel} />}
      </aside>
    </div>
  );
}

function PanelChrome({
  content,
  onClose,
}: {
  content: PanelContent;
  onClose: () => void;
}) {
  return (
    <>
      <div className="flex items-start gap-3 border-b border-warm px-5 py-4">
        <div className="min-w-0 flex-1">
          {content.subtitle && (
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-3">
              {content.subtitle}
            </div>
          )}
          <h2 className="mt-0.5 truncate text-[17px] font-bold text-ink">
            {content.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-ink-3 hover:bg-warm-soft hover:text-ink"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{content.body}</div>
    </>
  );
}
