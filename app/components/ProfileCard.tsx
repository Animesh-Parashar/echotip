import type { ResolvedProfile } from "./ProfileSearch";

function shorten(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ProfileCard({ profile }: { profile: ResolvedProfile }) {
  const label = profile.ensName ?? shorten(profile.address);
  const initials = profile.ensName
    ? profile.ensName.slice(0, 2).toUpperCase()
    : profile.address.slice(2, 4).toUpperCase();

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-[0_0_40px_-12px_rgba(34,211,238,0.5)]">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-white/10">
        {profile.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- ENS avatars come from arbitrary external hosts
          <img
            src={profile.avatar}
            alt={label}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 text-lg font-semibold text-cyan-300">
            {initials}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xl font-bold">{label}</p>
        <p className="truncate text-sm text-zinc-500">{shorten(profile.address)}</p>
        {profile.description && (
          <p className="mt-1 truncate text-sm text-zinc-300">{profile.description}</p>
        )}
        {profile.twitter && (
          <a
            href={`https://twitter.com/${profile.twitter}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-sm text-cyan-400 hover:underline"
          >
            @{profile.twitter}
          </a>
        )}
      </div>
    </div>
  );
}
