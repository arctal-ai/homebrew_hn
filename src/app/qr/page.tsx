"use client";

import Image from "next/image";
import HNNavBar from "@/features/hn-nav-bar";

export default function QRPage() {
  return (
    <HNNavBar>
      <div className="flex justify-center items-center">
        <div className="relative w-full aspect-square">
          <Image
            alt="QR Code for hackernews.coffee url"
            className="object-contain"
            fill
            priority
            src="/qr_hn_public_url.svg"
          />
        </div>
      </div>
    </HNNavBar>
  );
}
