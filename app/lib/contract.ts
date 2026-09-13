export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0x4b7cCF136f9f96c471E04bDAE987119430f99C40") as `0x${string}`;

export const TIP_BOARD_ABI = [
  {
    type: "function",
    name: "getTipCount",
    inputs: [{ name: "recipient", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTips",
    inputs: [{ name: "recipient", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct TipBoard.Tip[]",
        components: [
          { name: "sender", type: "address", internalType: "address" },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "message", type: "string", internalType: "string" },
          { name: "timestamp", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "sendTip",
    inputs: [
      { name: "recipient", type: "address", internalType: "address" },
      { name: "message", type: "string", internalType: "string" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "totalTips",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "TipSent",
    inputs: [
      { name: "from", type: "address", indexed: true, internalType: "address" },
      { name: "to", type: "address", indexed: true, internalType: "address" },
      { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "message", type: "string", indexed: false, internalType: "string" },
      { name: "timestamp", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
] as const;

export type Tip = {
  sender: `0x${string}`;
  amount: bigint;
  message: string;
  timestamp: bigint;
};
