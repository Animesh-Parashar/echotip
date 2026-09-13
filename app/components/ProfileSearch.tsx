"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
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

// A name that's plausibly finished typing (has a dot + 2+ letter TLD, e.g.
// "vitalik.eth") — used to auto-resolve without waiting for form submit.
const LOOKS_COMPLETE = /\.[a-z]{2,}$/i;

export function ProfileSearch({
  value,
  onChange,
  onResolved,
}: {
  value: string;
  onChange: (value: string) => void;
  onResolved: (profile: ResolvedProfile) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastResolvedRef = useRef<string | null>(null);

  const resolve = useCallback(
    async (raw: string) => {
      const query = raw.trim();
      if (!query || query === lastResolvedRef.current) return;

      setError(null);
      setLoading(true);
      try {
        let address: `0x${string}` | null;
        let ensName: string | null;

        if (isAddress(query)) {
          address = query;
          ensName = await mainnetClient.getEnsName({ address }).catch(() => null);
        } else {
          const normalized = normalize(query);
          address = await mainnetClient.getEnsAddress({ name: normalized });
          if (!address) {
            setError(`Couldn't resolve "${query}" to an address.`);
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

        lastResolvedRef.current = query;
        onResolved({ address, ensName, avatar, description, twitter });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to resolve name.");
      } finally {
        setLoading(false);
      }
    },
    [onResolved]
  );

  // Auto-resolve shortly after the user finishes typing a complete-looking
  // name or address — no need to hit Search.
  useEffect(() => {
    const trimmed = value.trim();
    if (!isAddress(trimmed) && !LOOKS_COMPLETE.test(trimmed)) return;
    const timer = setTimeout(() => resolve(trimmed), 400);
    return () => clearTimeout(timer);
  }, [value, resolve]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    resolve(value);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="group relative flex-1">
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            fill="none"
            className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-cyan-400"
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
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search an ENS name or address… (e.g. vitalik.eth)"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pr-4 pl-11 text-base text-zinc-100 shadow-inner shadow-black/20 backdrop-blur-xl transition-all placeholder:text-zinc-500 focus:border-cyan-400/60 focus:bg-white/[0.07] focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
          />
          {loading && (
            <span className="absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-4 text-sm font-semibold text-zinc-950 shadow-lg shadow-cyan-500/20 transition-all duration-150 hover:shadow-cyan-500/40 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
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
