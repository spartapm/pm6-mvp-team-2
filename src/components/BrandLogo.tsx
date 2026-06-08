"use client";

import Image from "next/image";

export default function BrandLogo({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/batong-logo.png"
        alt="Batong"
        width={compact ? 28 : 142}
        height={compact ? 28 : 28}
        className={`${compact ? "h-7 w-7" : "h-7 w-auto"} object-contain`}
        priority
      />
    </div>
  );
}
