# EchoTip — Build Spec
**An ENS-powered on-chain tip board.** Type in anyone's ENS name, see their resolved profile, and leave them a public on-chain tip + message. No more copy-pasting 0x addresses.

**Track:** ENS (Best Use of ENS) — the whole UX depends on ENS name resolution.

---

## ⏱️ Time budget (read this first)

- **Have 2–4 hours?** Build exactly what's in this doc, skip the "Stretch goals" section entirely. This is the priority order:
  1. Smart contract + deploy to Sepolia (30–45 min)
  2. Core frontend flow: search → resolve → tip → wall (rest of the time)
  3. README + screenshots (10 min)
- **Have less than that?** Cut the "message wall" list view — just show a success toast after tipping. The resolve-and-tip flow alone is enough to demo and qualify for the track.

Do not add authentication, a database, a subgraph, or multi-chain support. Every extra moving part is a way to run out of time before submission.

---

## 1. Problem & Solution

**Problem:** Tipping or crediting someone on-chain today means copying a long hex address — easy to mistype, no context, no history.

**Solution:** EchoTip lets you type a human-readable ENS name (e.g. `vitalik.eth`), instantly see their avatar/profile, and send them an ETH tip with a public message. Every recipient effectively gets a public "wall" of on-chain shout-outs tied to their ENS identity.

**On being simple, not generic:** a minimal build and a generic build aren't the same thing. Past ENS-track finalists at ETHOnline have won for nailing one small idea cleanly, not for scope. Two changes fold into the spec below to sharpen this without adding real build time: showing the recipient's ENS bio/socials, and reverse-resolving tip senders to their own ENS names too — so the wall reads as "alice.eth tipped bob.eth" instead of a wall of addresses. Pick a specific framing when you pitch it, too — "on-chain thank-you notes for open-source maintainers" reads far less generic than "a tip jar," even though it's the exact same code.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Smart contract | Solidity ^0.8.24, Hardhat |
| Contract network | Sepolia testnet (free test ETH, no real funds at risk) |
| ENS resolution | viem's built-in ENS actions, read against **Ethereum mainnet** (ENS names live there — you resolve them read-only even while tipping happens on testnet) |
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Web3 hooks | wagmi v2 + viem |
| Wallet connect | RainbowKit |
| Hosting | Vercel (frontend), Sepolia (contract) |

---

## 3. File Structure

```
echotip/
├── contracts/
│   └── TipBoard.sol
├── scripts/
│   └── deploy.ts
├── test/
│   └── TipBoard.test.ts
├── hardhat.config.ts
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── components/
│   │   ├── ProfileSearch.tsx
│   │   ├── ProfileCard.tsx
│   │   ├── TipForm.tsx
│   │   └── MessageWall.tsx
│   └── lib/
│       ├── wagmiConfig.ts
│       └── contract.ts   (address + ABI, filled in after deploy)
├── .env.example
├── package.json
└── README.md
```

---

## 4. Smart Contract — `contracts/TipBoard.sol`

Use this exact contract. It's intentionally minimal and already correct — don't redesign it.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TipBoard {
    struct Tip {
        address sender;
        uint256 amount;
        string message;
        uint256 timestamp;
    }

    mapping(address => Tip[]) private tipsReceived;
    uint256 public totalTips;

    event TipSent(
        address indexed from,
        address indexed to,
        uint256 amount,
        string message,
        uint256 timestamp
    );

    function sendTip(address recipient, string calldata message) external payable {
        require(recipient != address(0), "Invalid recipient");
        require(bytes(message).length <= 280, "Message too long");

        tipsReceived[recipient].push(Tip({
            sender: msg.sender,
            amount: msg.value,
            message: message,
            timestamp: block.timestamp
        }));

        totalTips += 1;

        if (msg.value > 0) {
            (bool sent, ) = recipient.call{value: msg.value}("");
            require(sent, "Transfer failed");
        }

        emit TipSent(msg.sender, recipient, msg.value, message, block.timestamp);
    }

    function getTips(address recipient) external view returns (Tip[] memory) {
        return tipsReceived[recipient];
    }

    function getTipCount(address recipient) external view returns (uint256) {
        return tipsReceived[recipient].length;
    }
}
```

**One test to write** (`test/TipBoard.test.ts`): deploy the contract, call `sendTip` with a value and message, assert the event fires, `getTips` returns one entry, and the recipient's balance increased.

---

## 5. Frontend Spec

### `ProfileSearch.tsx`
- One text input: "Enter an ENS name or address"
- On submit, resolve via a **mainnet** viem public client:
  ```ts
  const address = await mainnetClient.getEnsAddress({ name: normalize(input) })
  const avatar = await mainnetClient.getEnsAvatar({ name: normalize(input) })
  ```
- If input is already a `0x...` address, skip resolution and use it directly.

### `ProfileCard.tsx`
- Shows avatar (fallback to a generic blockie/identicon if none), the ENS name, and the resolved address (shortened, e.g. `0xAb12…F90e`)
- Also fetch 1–2 ENS text records via `getEnsText` (e.g. `description` and `com.twitter`) if set — one extra viem call each, cheap to add, and makes the profile feel like a real identity instead of just an address

### `TipForm.tsx`
- Message textarea (max 280 chars, show live counter)
- Optional ETH amount input (default `0.001`)
- "Send Tip" button → `useWriteContract` calling `sendTip(recipientAddress, message)` with `value` in wei
- Show pending / success / error states clearly (this matters a lot for the demo video)

### `MessageWall.tsx`
- `useReadContract` calling `getTips(recipientAddress)`
- Render newest-first: reverse-resolve each sender's address to an ENS name via `getEnsName` (fall back to the shortened address if they don't have one), the message, amount in ETH, and a relative timestamp — this is what makes the wall read as names talking to names, not addresses talking to addresses
- Re-fetch after a successful tip so the wall updates live

### Wagmi config (`lib/wagmiConfig.ts`)
- Chains: `mainnet` (read-only, for ENS) + `sepolia` (for the contract)
- RainbowKit default connectors

---

## 6. Build Order (do these in sequence)

1. `npx create-next-app@latest echotip --typescript --tailwind --app`
2. `npm install wagmi viem @rainbow-me/rainbowkit @tanstack/react-query`
3. In a separate `contracts/` workspace (or same repo root): `npx hardhat init` → TypeScript project
4. Add `TipBoard.sol` exactly as above, compile: `npx hardhat compile`
5. Write and run the one test: `npx hardhat test`
6. Write `scripts/deploy.ts`, deploy to Sepolia:
   `npx hardhat run scripts/deploy.ts --network sepolia`
7. Copy the deployed address + ABI (from `artifacts/`) into `app/lib/contract.ts`
8. Build components in this order: `wagmiConfig.ts` → `ProfileSearch` → `ProfileCard` → `TipForm` → `MessageWall` → wire into `page.tsx`
9. Manual QA: connect a wallet (get Sepolia test ETH from any public faucet first), resolve a real ENS name (e.g. `vitalik.eth` or your own if you have one), send a tip, confirm it shows up in the wall and on Sepolia Etherscan
10. Quick Tailwind pass — dark background, one accent color, nothing fancy
11. `vercel deploy` (or connect the GitHub repo to Vercel)
12. Write `README.md`: what it does, tech stack, contract address + Etherscan link, screenshots, local setup steps

---

## 7. Environment Variables (`.env.example`)

```
# Deployment (use a throwaway test wallet — never your main wallet's key)
SEPOLIA_RPC_URL=
PRIVATE_KEY=
ETHERSCAN_API_KEY=          # optional, for contract verification

# Frontend
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_MAINNET_RPC_URL=   # for ENS resolution; a public RPC works fine
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=   # free from WalletConnect Cloud
```

---

## 8. Stretch Goals (only if time allows — skip by default)

- A tiny leaderboard of "most tipped" ENS names
- Make the ENS avatar clickable, linking back into a fresh profile search for that name

---

## 9. Demo Video Script (for the Gemini video overview)

Keep it under 2:30. Screen-record the actual app; narrate over it.

1. **0:00–0:15** — Hook: "Tipping someone on-chain usually means copy-pasting a scary 0x address. What if you could just use their ENS name?"
2. **0:15–0:35** — Problem: show a raw address, point out how error-prone/impersonal it is.
3. **0:35–1:10** — Type an ENS name into EchoTip, show it resolve live to an avatar + profile.
4. **1:10–1:45** — Write a message, send a small tip, show the wallet confirmation popping up.
5. **1:45–2:10** — Show the message wall updating, then flip to Sepolia Etherscan to show the transaction/contract for credibility.
6. **2:10–2:30** — Close: "Built with Solidity, Next.js, wagmi, and viem's native ENS support — for the ENS track."

---

## 10. Why this fits the ENS track

The core interaction — searching, resolving, and displaying a profile — is impossible without ENS. It's not a bolt-on; ENS name resolution *is* the product's UX.
