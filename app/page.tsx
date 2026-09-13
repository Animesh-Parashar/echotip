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
        <div>
          <h1 className="text-2xl font-bold">EchoTip</h1>
          <p className="text-sm text-zinc-400">
            On-chain thank-you notes for ENS names.
          </p>
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
        <div className="flex flex-col gap-6">
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
        <p className="text-sm text-zinc-500">
          Search an ENS name above to see their profile and leave a tip.
        </p>
      )}
    </div>
  );
}
