import { Github, Linkedin, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export function PlannerFooter() {
  return (
    <footer className="mt-8 border-t border-warm bg-warm">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-[12px] text-ink-3 sm:flex-row sm:px-6">
        <p>
          Built by{" "}
          <a
            href="https://www.linkedin.com/in/kevin-wang-08836a175/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-ink-2 underline underline-offset-2 hover:text-ink"
          >
            <Linkedin size={12} aria-hidden="true" /> Kevin Wang
          </a>
          . Source on{" "}
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-ink-2 underline underline-offset-2 hover:text-ink"
          >
            <Github size={12} aria-hidden="true" /> GitHub
          </a>
          . Community on{" "}
          <a
            href="https://discord.gg/gBfnGd4fxQ"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-ink-2 underline underline-offset-2 hover:text-ink"
          >
            <MessageCircle size={12} aria-hidden="true" /> Discord
          </a>
          .
        </p>
        <p className="text-[11px] text-ink-3">
          Unofficial. Not affiliated with Georgia Tech.
        </p>
      </div>
    </footer>
  );
}
