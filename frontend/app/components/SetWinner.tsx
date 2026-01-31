"use client";

import { useState } from "react";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import IDL from "@/app/idl/betinco.json";

const PROGRAM_ID = new PublicKey("H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77");
const HELIUS_RPC = "https://devnet.helius-rpc.com/?api-key=921ba1f0-fa17-4803-8417-e8c04743d961";

export default function SetWinner({ marketId }: { marketId: string }) {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const settleMarket = async (winner: "YES" | "NO" | "DRAW") => {
    if (!anchorWallet) {
      alert("Please connect your wallet");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const connection = new Connection(HELIUS_RPC, "confirmed");
      const provider = new AnchorProvider(connection, anchorWallet, {
        commitment: "confirmed",
      });

      const program = new Program(IDL as any, provider);

      const marketIdNum = parseInt(marketId);
      const marketIdBuffer = Buffer.alloc(4);
      marketIdBuffer.writeUInt32LE(marketIdNum, 0);

      const [marketPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("market"), marketIdBuffer],
        program.programId,
      );

      const winningOutcome =
        winner === "YES"
          ? { outcomeA: {} }
          : winner === "NO"
            ? { outcomeB: {} }
            : { neither: {} };

      const tx = await program.methods
        .setWinningSide(marketIdNum, winningOutcome)
        .accounts({
          authority: anchorWallet.publicKey,
          market: marketPda,
        })
        .rpc();

      console.log("✅ Market settled! TX:", tx);
      alert(`✅ Market settled! Winner: ${winner}\nTX: ${tx}`);
      setSuccess(true);
    } catch (error: any) {
      console.error("Error:", error);
      alert(`❌ Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        border: "2px solid #000",
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "550px",
        margin: "20px auto",
        background: "#fff9e6",
      }}
    >
      <h3 style={{ marginTop: 0 }}>⚖️ Settle Market</h3>

      <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
        Market ID: {marketId}
      </p>

      <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
        <button
          onClick={() => settleMarket("YES")}
          disabled={loading}
          style={{
            flex: 1,
            padding: "16px",
            background: loading ? "#9ca3af" : "#22c55e",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          YES Wins
        </button>
        <button
          onClick={() => settleMarket("NO")}
          disabled={loading}
          style={{
            flex: 1,
            padding: "16px",
            background: loading ? "#9ca3af" : "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          NO Wins
        </button>
      </div>

      <button
        onClick={() => settleMarket("DRAW")}
        disabled={loading}
        style={{
          width: "100%",
          padding: "16px",
          background: loading ? "#9ca3af" : "#6b7280",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "16px",
          fontWeight: 600,
        }}
      >
        Draw (Refund)
      </button>

      {success && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "#dcfce7",
            color: "#16a34a",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          ✅ Market settled!
        </div>
      )}
    </div>
  );
}