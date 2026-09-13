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

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
    >
      <label className="text-sm font-medium text-zinc-300">
        Message for {recipientLabel}
      </label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
        rows={3}
        placeholder="Thanks for shipping ENS! 🎉"
        className="resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>
          {message.length}/{MAX_MESSAGE_LENGTH}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-zinc-300">Amount (ETH)</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min="0"
          step="0.001"
          className="w-28 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <button
        type="submit"
        disabled={!isConnected || busy || !message.trim()}
        className="rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {!isConnected
          ? "Connect wallet to tip"
          : isPending
            ? "Confirm in wallet…"
            : isConfirming
              ? "Sending tip…"
              : "Send Tip"}
      </button>

      {isConfirmed && (
        <p className="text-sm text-green-400">
          Tip sent! It should appear on the wall below.
        </p>
      )}
      {error && (
        <p className="text-sm text-red-400">
          {error.message.length > 160
            ? "Transaction failed. Please try again."
            : error.message}
        </p>
      )}
    </form>
  );
}
