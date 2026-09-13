"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { Hero } from "./components/Hero";
import { MessageWall } from "./components/MessageWall";
import { ProfileCard } from "./components/ProfileCard";
import { ProfileSearch, type ResolvedProfile } from "./components/ProfileSearch";
import { TipForm } from "./components/TipForm";

export default function Home() {
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState<ResolvedProfile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const searchBar = (
    <ProfileSearch
      value={query}
      onChange={setQuery}
      onResolved={(p) => {
        setProfile(p);
        setRefreshKey(0);
      }}
    />
  );

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-lg shadow-lg shadow-cyan-500/20">
              📣
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-cyan-300 via-cyan-200 to-fuchsia-300 bg-clip-text text-xl font-extrabold text-transparent">
                EchoTip
              </h1>
              <p className="hidden text-xs text-zinc-500 sm:block">
                On-chain thank-you notes for ENS names.
              </p>
            </div>
          </div>
          <ConnectButton />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
        {!profile && <Hero onPick={setQuery}>{searchBar}</Hero>}
        {profile && (
          <>
            {searchBar}
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
          </>
        )}
      </div>
    </>
  );
}
