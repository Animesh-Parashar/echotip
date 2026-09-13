"use client";

import type { ReactNode } from "react";
import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, TIP_BOARD_ABI } from "../lib/contract";

const QUICK_PICKS = ["vitalik.eth", "nick.eth", "brantly.eth", "jesse.base.eth"];

const STEPS = [
  {
    title: "Search",
    body: "Type any ENS name — no more copy-pasting 0x addresses.",
    icon: "🔎",
  },
  {
    title: "Resolve",
    body: "We pull their live avatar, bio, and socials straight from mainnet.",
    icon: "🪪",
  },
  {
    title: "Tip",
    body: "Send ETH + a public message. It's recorded on-chain, forever.",
    icon: "⚡",
  },
];

export function Hero({
  onPick,
  children,
}: {
  onPick: (name: string) => void;
  children: ReactNode;
}) {
  const { data: totalTips } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TIP_BOARD_ABI,
    functionName: "totalTips",
  });

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center [animation:fade-in-up_0.5s_ease-out_both]">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-cyan-300 backdrop-blur-xl">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
        Live on Sepolia · {totalTips !== undefined ? totalTips.toString() : "…"} tips sent on-chain
      </div>

      <h2 className="max-w-xl text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
        <span className="bg-gradient-to-br from-white via-white to-zinc-400 bg-clip-text text-transparent">
          Turn any ENS name
        </span>
        <br />
        <span className="bg-gradient-to-r from-cyan-300 via-cyan-200 to-fuchsia-400 bg-clip-text text-transparent">
          into a tip jar.
        </span>
      </h2>

      <p className="max-w-md text-base text-zinc-400">
        On-chain thank-you notes for maintainers, speakers, and friends —
        searched, resolved, and tipped by their ENS identity.
      </p>

      <div className="w-full max-w-xl">{children}</div>

      <div className="-mt-2 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-zinc-500">Try:</span>
        {QUICK_PICKS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onPick(name)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-cyan-400/40 hover:text-cyan-300"
          >
            {name}
          </button>
        ))}
      </div>

      <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div
            key={step.title}
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
          >
            <span className="text-2xl">{step.icon}</span>
            <p className="text-sm font-semibold text-zinc-200">{step.title}</p>
            <p className="text-xs text-zinc-500">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
