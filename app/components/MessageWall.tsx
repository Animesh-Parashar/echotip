"use client";

import { useEffect, useRef, useState } from "react";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, TIP_BOARD_ABI, type Tip } from "../lib/contract";
import { mainnetClient } from "../lib/ensClient";

function shorten(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function timeAgo(timestampSeconds: bigint): string {
  const seconds = Math.max(
    0,
    Math.floor(Date.now() / 1000) - Number(timestampSeconds)
  );
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function MessageWall({
  recipientAddress,
  refreshKey,
}: {
  recipientAddress: `0x${string}`;
  refreshKey: number;
}) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TIP_BOARD_ABI,
    functionName: "getTips",
    args: [recipientAddress],
  });
  const tips = data as readonly Tip[] | undefined;

  if (error) {
    // eslint-disable-next-line no-console
    console.error("getTips error:", error);
  }

  useEffect(() => {
    if (refreshKey > 0) refetch();
  }, [refreshKey, refetch]);

  const [nameCache, setNameCache] = useState<Record<string, string | null>>({});
  const nameCacheRef = useRef(nameCache);
  nameCacheRef.current = nameCache;

  useEffect(() => {
    if (!tips || tips.length === 0) return;
    const unique = Array.from(new Set(tips.map((t) => t.sender)));
    const missing = unique.filter((addr) => nameCacheRef.current[addr] === undefined);
    if (missing.length === 0) return;

    let cancelled = false;
    Promise.all(
      missing.map(async (addr) => {
        const name = await mainnetClient
          .getEnsName({ address: addr })
          .catch(() => null);
        return [addr, name] as const;
      })
    ).then((entries) => {
      if (cancelled) return;
      setNameCache((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    });

    return () => {
      cancelled = true;
    };
  }, [tips]);

  const sorted = tips ? [...tips].reverse() : [];

  return (
    <div className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <span>🧾</span> Tips received {tips ? `(${tips.length})` : ""}
      </h2>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      )}
      {!isLoading && error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          Couldn't load tips: {error.message.length > 140 ? "check the contract address and network." : error.message}
        </p>
      )}
      {!isLoading && !error && sorted.length === 0 && (
        <p className="rounded-xl border border-dashed border-white/15 px-4 py-6 text-center text-sm text-zinc-500">
          No tips yet, be the first to send one.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {sorted.map((tip, i) => (
          <li
            key={i}
            style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition-colors duration-200 [animation:fade-in-up_0.35s_ease-out_both] hover:border-gold/30"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gold-light">
                {nameCache[tip.sender] ?? shorten(tip.sender)}
              </span>
              <span className="text-zinc-500">{timeAgo(tip.timestamp)}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-200">{tip.message}</p>
            {tip.amount > BigInt(0) && (
              <p className="mt-1 text-xs text-zinc-500">
                {formatEther(tip.amount)} ETH
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
