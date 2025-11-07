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
    <Banner className="py-2" inset>
      <BannerTitle className="text-center w-full text-xs sm:text-sm">
        Enjoying using this tool? Please try my new product{" "}
        <a
          href={`https://hotelsallow.com?utm_source=transfertogatech&utm_medium=banner&utm_campaign=${utmCampaign}`}
          target="_blank"
          rel="noopener"
          className="underline font-semibold hover:opacity-80 transition-opacity"
        >
          hotelsallow.com
        </a>{" "}
        to search hotels that allow 18-21 year olds!
      </BannerTitle>
      <BannerClose />
    </Banner>
  );
}
