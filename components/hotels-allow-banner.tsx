"use client";

import {
  Banner,
  BannerTitle,
  BannerClose,
} from "@/components/ui/shadcn-io/banner";

interface HotelsAllowBannerProps {
  utmCampaign: string;
}

export function HotelsAllowBanner({ utmCampaign }: HotelsAllowBannerProps) {
  return (
    <Banner
      className="rounded-2xl border border-warm bg-warm-soft px-4 py-2.5 text-ink-2"
      inset
    >
      <BannerTitle className="w-full text-center text-[12px] font-medium sm:text-[12.5px]">
        Enjoying this tool? Try my other project{" "}
        <a
          href={`https://hotelsallow.com?utm_source=transfertogatech&utm_medium=banner&utm_campaign=${utmCampaign}`}
          target="_blank"
          rel="noopener"
          className="font-semibold text-warm-accent-ink underline underline-offset-2 hover:text-warm-accent dark:text-warm-accent dark:hover:brightness-110"
        >
          hotelsallow.com
        </a>{" "}
        — search hotels that allow 18–21-year-olds.
      </BannerTitle>
      <BannerClose className="text-ink-3 hover:bg-warm hover:text-ink" />
    </Banner>
  );
}
