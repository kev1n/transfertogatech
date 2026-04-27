"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Share2 } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

interface HeaderProps {
  getShareUrl: () => string;
  shareDisabled: boolean;
}

export function Header({ getShareUrl, shareDisabled }: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback: open prompt with URL
      window.prompt("Copy this link to share your plan:", url);
    }
  };

  return (
    <header className="border-b border-warm bg-warm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <a href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.svg"
            width={32}
            height={32}
            alt=""
            className="h-8 w-8"
          />
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-tight text-ink">
              transfer<span className="text-warm-accent">to</span>gatech
            </div>
            <div className="text-[10px] text-ink-3">
              The unofficial GT transfer tool
            </div>
          </div>
        </a>
        <div className="flex-1" />
        <ModeToggle />
        <button
          type="button"
          onClick={handleShare}
          disabled={shareDisabled}
          className="inline-flex items-center gap-1.5 rounded-full border border-warm-2 bg-warm-surface px-3.5 py-2 text-xs font-bold text-ink hover:bg-warm-soft disabled:cursor-not-allowed disabled:opacity-50 sm:text-[13px]"
        >
          {copied ? (
            <>
              <Check size={13} /> Copied
            </>
          ) : (
            <>
              <Share2 size={13} /> Share plan
            </>
          )}
        </button>
      </div>
    </header>
  );
}
