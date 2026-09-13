# ETHGlobal Submission Info — EchoTip

Everything drafted below is ready to paste. Anything in `[BRACKETS]` still needs you to fill it in.

---

## Basic Info

- **Project name:** EchoTip
- **Track / prize submitting for:** ENS — Best Use of ENS *(check your event's actual sponsor list — swap this if ENS isn't listed)*
- **Team members (ETHGlobal usernames):** [FILL IN]

---

## One-line pitch (≤140 characters)

Pick whichever framing fits your demo best — same project, sharper story:

> Send an ETH tip and a public on-chain message to anyone's ENS name — no more copy-pasting 0x addresses.

> On-chain thank-you notes: tip and publicly credit open-source maintainers, speakers, or friends by their ENS name.

---

## Full Description
*(paste into the "Description" field)*

EchoTip is a simple on-chain tipping and message board built around ENS identities. Instead of tipping or thanking someone with a long, easy-to-mistype 0x address, EchoTip lets you type in their ENS name (like vitalik.eth), automatically resolve their profile — name, avatar, and address — and send them a small ETH tip together with a public message.

Every tip is recorded on-chain in a lightweight smart contract, so each ENS name effectively gets its own public "wall" of tips and shout-outs that anyone can view. It's a small piece of social infrastructure for the ENS ecosystem: turning a human-readable name into a shareable, tippable identity with a visible history of support.

We built this to show how much friction ENS removes from everyday on-chain interactions — no address book, no clipboard, just a name.

---

## How It's Made
*(paste into the "How it's Made" / technical details field)*

EchoTip has two parts: a Solidity smart contract (`TipBoard.sol`) deployed on Sepolia that stores tips as `(sender, amount, message, timestamp)` structs per recipient address and emits a `TipSent` event, and a Next.js + TypeScript frontend using wagmi, viem, and RainbowKit for wallet connection and contract calls.

ENS resolution happens client-side using viem's built-in ENS actions (`getEnsAddress`, `getEnsAvatar`) against an Ethereum mainnet RPC, so users can type any ENS name and instantly see the resolved address, avatar, and profile — even though the tipping contract itself lives on a testnet, keeping the demo free to use. The frontend reads a recipient's tip history straight from the contract with `getTips(address)` and renders it as a live-updating wall.

We used Hardhat for contract development, testing, and deployment, and Vercel for hosting the frontend.

---

## Required Links (fill in before submitting)

- [ ] **GitHub repo (must be public):** [FILL IN]
- [ ] **Demo video (YouTube, unlisted is fine):** [FILL IN]
- [ ] **Live app URL (Vercel):** [FILL IN]
- [ ] **Deployed contract address (Sepolia):** [FILL IN]
- [ ] **Etherscan link to the contract:** [FILL IN] *(optional but adds credibility for judges)*

---

## Pre-submission Checklist

- [ ] **Disclosed AI tool usage** somewhere in the submission (README or description) — ETHGlobal explicitly permits tools like Claude/Cursor/Antigravity but requires you to document their use for transparency
- [ ] **Repo has multiple incremental commits**, not one giant dump — ETHGlobal has flagged single-commit or missing-history submissions as a disqualification risk, so commit in a few stages as the build progresses, even under time pressure
- [ ] Repo visibility set to **public**
- [ ] README includes: what it does, tech stack, contract address, setup steps, at least one screenshot
- [ ] Contract actually deployed and callable on Sepolia (test it live, not just compiled)
- [ ] Video link opens correctly in an incognito window (judges won't be logged into your account)
- [ ] Live demo link loads without errors on a fresh browser/wallet
- [ ] Double-checked your event's **exact submission deadline and timezone**
- [ ] Confirmed the **staking/refund requirements** for your specific hackathon on its event page — these vary by event, so verify what counts as a "valid submission" for getting your stake back
- [ ] Submitted with time to spare in case of upload/platform issues
