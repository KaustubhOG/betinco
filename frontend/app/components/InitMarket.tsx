"use client";

import { useState, useEffect } from "react";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import BN from "bn.js";
import IDL from "@/app/idl/betinco.json";

const PROGRAM_ID = new PublicKey(
  "H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77",
);
const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const HELIUS_RPC = "https://devnet.helius-rpc.com/?api-key=921ba1f0-fa17-4803-8417-e8c04743d961";

export default function InitMarket() {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const [marketId, setMarketId] = useState("");
  const [question, setQuestion] = useState("");
  const [seconds, setSeconds] = useState("300");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const initializeMarket = async () => {
    if (!anchorWallet) {
      alert("Please connect your wallet");
      return;
    }

    if (!marketId || parseInt(marketId) <= 0) {
      alert("Please enter a valid market ID");
      return;
    }

    if (!question || question.length > 200) {
      alert("Question required (max 200 chars)");
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
      const now = Math.floor(Date.now() / 1000);
      const settlementDeadline = new BN(now + parseInt(seconds));

      const marketIdBuffer = Buffer.alloc(4);
      marketIdBuffer.writeUInt32LE(marketIdNum, 0);

      const [marketPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("market"), marketIdBuffer],
        program.programId,
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), marketIdBuffer],
        program.programId,
      );

      const tx = await program.methods
        .initializeMarket(marketIdNum, question, settlementDeadline)
        .accounts({
          market: marketPda,
          authority: anchorWallet.publicKey,
          collateralMint: WSOL_MINT,
          collateralVault: vaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: new PublicKey("11111111111111111111111111111111"),
          rent: new PublicKey("SysvarRent111111111111111111111111111111111"),
        })
        .rpc();

      console.log("✅ Market initialized! TX:", tx);
      setSuccess(true);
      setMarketId("");
      setQuestion("");
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        border: "2px solid #000",
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "500px",
        margin: "20px auto",
        background: "#fff9e6",
      }}
    >
      <h3 style={{ marginTop: 0 }}>🔧 Admin: Initialize Market</h3>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
        >
          Market ID
        </label>
        <input
          type="number"
          value={marketId}
          onChange={(e) => setMarketId(e.target.value)}
          placeholder="Enter unique ID (e.g., 1, 2, 3...)"
          min="1"
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            border: "2px solid #000",
            borderRadius: "8px",
            boxSizing: "border-box"
          }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
        >
          Market Question (max 200 chars)
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., Will it rain tomorrow in New York?"
          maxLength={200}
          rows={3}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            border: "2px solid #000",
            borderRadius: "8px",
            resize: "vertical",
            boxSizing: "border-box"
          }}
        />
        <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
          {question.length}/200 characters
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
        >
          Settlement Deadline
        </label>
        <select
          value={seconds}
          onChange={(e) => setSeconds(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            border: "2px solid #000",
            borderRadius: "8px",
            marginBottom: "8px",
            boxSizing: "border-box"
          }}
        >
          <option value="300">5 minutes (testing)</option>
          <option value="3600">1 hour</option>
          <option value="21600">6 hours</option>
          <option value="86400">24 hours (1 day)</option>
          <option value="259200">3 days</option>
          <option value="604800">7 days (1 week)</option>
        </select>
        <input
          type="number"
          value={seconds}
          onChange={(e) => setSeconds(e.target.value)}
          min="60"
          placeholder="Or enter custom seconds"
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            border: "2px solid #000",
            borderRadius: "8px",
            boxSizing: "border-box"
          }}
        />
        <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
          Deadline: {mounted && new Date(Date.now() + parseInt(seconds || "0") * 1000).toLocaleString()}
        </div>
      </div>

      <button
        onClick={initializeMarket}
        disabled={loading || !wallet.publicKey}
        style={{
          width: "100%",
          padding: "16px",
          background: loading ? "#9ca3af" : "#000",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "18px",
          fontWeight: 600,
        }}
      >
        {loading ? "Initializing..." : "Initialize Market"}
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
          ✅ Market initialized successfully!
        </div>
      )}
    </div>
  );
}