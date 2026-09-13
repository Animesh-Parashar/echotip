"use client";

import { useState } from "react";

export function Logo() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gold/25 bg-navy-card">
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- small local static asset, no next/image config needed
        <img
          src="/logo-mark.png"
          alt="EchoTip"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <circle cx="12" cy="12" r="2" fill="var(--color-gold)" />
          <path
            d="M8 12a4 4 0 0 1 8 0M5.5 12a6.5 6.5 0 0 1 13 0"
            stroke="var(--color-gold)"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
      )}
    </div>
  );
}
