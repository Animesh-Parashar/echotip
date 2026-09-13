"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { MessageWall } from "./components/MessageWall";
import { ProfileCard } from "./components/ProfileCard";
import { ProfileSearch, type ResolvedProfile } from "./components/ProfileSearch";
import { TipForm } from "./components/TipForm";

export default function Home() {
  const [profile, setProfile] = useState<ResolvedProfile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-lg shadow-lg shadow-cyan-500/20">
            📣
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-cyan-300 via-cyan-200 to-fuchsia-300 bg-clip-text text-2xl font-bold text-transparent">
              EchoTip
            </h1>
            <p className="text-sm text-zinc-400">
              On-chain thank-you notes for ENS names.
            </p>
          </div>
        </div>
        <ConnectButton />
      </header>

      <ProfileSearch
        onResolved={(p) => {
          setProfile(p);
          setRefreshKey(0);
        }}
      />

      {profile && (
        <div
          key={profile.address}
          className="flex flex-col gap-6 [animation:fade-in-up_0.4s_ease-out_both]"
        >
          <ProfileCard profile={profile} />
          <TipForm
            recipientAddress={profile.address}
            recipientLabel={profile.ensName ?? profile.address}
            onTipped={() => setRefreshKey((k) => k + 1)}
          />
          <MessageWall recipientAddress={profile.address} refreshKey={refreshKey} />
        </div>
      )}

      {!profile && (
        <p className="rounded-xl border border-dashed border-zinc-800 px-4 py-6 text-center text-sm text-zinc-500 [animation:fade-in-up_0.4s_ease-out_both]">
          Search an ENS name above to see their profile and leave a tip.
        </p>
      )}
    </div>
  );
}
