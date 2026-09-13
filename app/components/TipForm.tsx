"use client";

import { useEffect, useState, type FormEvent } from "react";
import { parseEther } from "viem";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { CONTRACT_ADDRESS, TIP_BOARD_ABI } from "../lib/contract";

const MAX_MESSAGE_LENGTH = 280;
const AMOUNT_PRESETS = ["0.001", "0.005", "0.01"];

export function TipForm({
  recipientAddress,
  recipientLabel,
  onTipped,
}: {
  recipientAddress: `0x${string}`;
  recipientLabel: string;
  onTipped: () => void;
}) {
  const { isConnected } = useAccount();
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("0.001");

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!isConfirmed) return;
    onTipped();
    setMessage("");
    const timeout = setTimeout(() => reset(), 4000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    let value: bigint;
    try {
      value = parseEther(amount || "0");
    } catch {
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: TIP_BOARD_ABI,
      functionName: "sendTip",
      args: [recipientAddress, message],
      value,
    });
  }

  const error = writeError ?? receiptError;
  const busy = isPending || isConfirming;
  const nearLimit = message.length > MAX_MESSAGE_LENGTH - 30;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors duration-300 hover:border-white/20"
    >
      <label className="text-sm font-medium text-zinc-300">
        Message for {recipientLabel}
      </label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
        rows={3}
        placeholder="Thanks for shipping ENS! 🎉"
        className="resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 transition-shadow focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/30"
      />
      <div className="flex items-center justify-between text-xs">
        <span className={nearLimit ? "text-amber-400" : "text-zinc-500"}>
          {message.length}/{MAX_MESSAGE_LENGTH}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-zinc-300">Amount (ETH)</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min="0"
          step="0.001"
          className="w-28 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-100 transition-shadow focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
        <div className="flex gap-1.5">
          {AMOUNT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                amount === preset
                  ? "border-gold/60 bg-gold/10 text-gold-light"
                  : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!isConnected || busy || !message.trim()}
        className="rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-[#0a1420] shadow-lg shadow-gold/10 transition-all duration-150 hover:bg-gold-light active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
      >
        <span className="inline-flex items-center justify-center gap-2">
          {busy && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" />
          )}
          {!isConnected
            ? "Connect wallet to tip"
            : isPending
              ? "Confirm in wallet…"
              : isConfirming
                ? "Sending tip…"
                : "Send Tip"}
        </span>
      </button>

      {isConfirmed && (
        <p className="text-sm text-green-400 [animation:fade-in-up_0.3s_ease-out_both]">
          ✓ Tip sent! It should appear on the wall below.
        </p>
      )}
      {error && (
        <p className="text-sm text-red-400 [animation:fade-in-up_0.3s_ease-out_both]">
          {error.message.length > 160
            ? "Transaction failed. Please try again."
            : error.message}
        </p>
      )}
    </form>
  );
}
