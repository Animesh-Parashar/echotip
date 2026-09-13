"use client";

import { useState, type FormEvent } from "react";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import { mainnetClient } from "../lib/ensClient";

export type ResolvedProfile = {
  address: `0x${string}`;
  ensName: string | null;
  avatar: string | null;
  description: string | null;
  twitter: string | null;
};

export function ProfileSearch({
  onResolved,
}: {
  onResolved: (profile: ResolvedProfile) => void;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;

    setError(null);
    setLoading(true);
    try {
      let address: `0x${string}` | null;
      let ensName: string | null;

      if (isAddress(value)) {
        address = value;
        ensName = await mainnetClient.getEnsName({ address }).catch(() => null);
      } else {
        const normalized = normalize(value);
        address = await mainnetClient.getEnsAddress({ name: normalized });
        if (!address) {
          setError(`Couldn't resolve "${value}" to an address.`);
          return;
        }
        ensName = normalized;
      }

      let avatar: string | null = null;
      let description: string | null = null;
      let twitter: string | null = null;

      if (ensName) {
        [avatar, description, twitter] = await Promise.all([
          mainnetClient.getEnsAvatar({ name: ensName }).catch(() => null),
          mainnetClient
            .getEnsText({ name: ensName, key: "description" })
            .catch(() => null),
          mainnetClient
            .getEnsText({ name: ensName, key: "com.twitter" })
            .catch(() => null),
        ]);
      }

      onResolved({ address, ensName, avatar, description, twitter });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve name.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            fill="none"
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500"
          >
            <path
              d="M9 16A7 7 0 1 0 9 2a7 7 0 0 0 0 14ZM18 18l-3.8-3.8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter an ENS name or address (e.g. vitalik.eth)"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-3 pr-4 pl-10 text-sm text-zinc-100 placeholder:text-zinc-500 transition-shadow focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-lg bg-cyan-500 px-5 py-3 text-sm font-medium text-zinc-950 transition-all duration-150 hover:bg-cyan-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Resolving…" : "Search"}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-400 [animation:fade-in-up_0.3s_ease-out_both]">
          {error}
        </p>
      )}
    </form>
  );
}
