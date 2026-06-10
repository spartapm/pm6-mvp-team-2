"use client";

import Image from "next/image";

export default function BrandLogo({
  className = "",
  size = "header",
}: {
  className?: string;
  size?: "compact" | "header" | "hero";
}) {
  const styleBySize = {
    compact: { width: 28, height: 28, imageClass: "h-7 w-7" },
    header: { width: 220, height: 56, imageClass: "h-9 w-auto" },
    hero: { width: 420, height: 130, imageClass: "h-20 w-auto" },
  } as const;
  const style = styleBySize[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/batong-logo.png"
        alt="Batong"
        width={style.width}
        height={style.height}
        className={`${style.imageClass} object-contain`}
        priority
      />
    </div>
  );
}
