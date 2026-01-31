"use client";

import { useState } from "react";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";

const HELIUS_RPC = "https://devnet.helius-rpc.com/?api-key=921ba1f0-fa17-4803-8417-e8c04743d961";

export default function GrantPermission({ marketId }: { marketId: string }) {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);
  const [granted, setGranted] = useState(false);

  const grantPermission = async () => {
    if (!anchorWallet || !wallet.publicKey) {
      alert("Please connect wallet");
      return;
    }

    setLoading(true);

    try {
      const connection = new Connection(HELIUS_RPC, "confirmed");
      
      console.log("🔑 Granting decrypt permission for market", marketId);
      
      // Import and use the permission granting function
      const { grantIncoDecryptPermission } = await import("../lib/grantIncoPermission");
      
      const signature = await grantIncoDecryptPermission(
        connection,
        anchorWallet,
        marketId
      );

      console.log("✅ Permission granted:", signature);
      alert(`✅ Decrypt permission granted!\n\nNow you can claim rewards for this market.\n\nTX: ${signature}`);
      setGranted(true);
    } catch (e: any) {
      console.error("❌ Error granting permission:", e);
      
      let msg = "Failed to grant permission";
      if (e.message) {
        if (e.message.includes("No bet found")) {
          msg = "You haven't placed a bet on this market yet";
        } else {
          msg = e.message.substring(0, 150);
        }
      }
      
      alert(`❌ ${msg}\n\nCheck console for details`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      border: "2px solid #f59e0b",
      padding: 16,
      borderRadius: 8,
      background: "#fffbeb",
      marginTop: 12
    }}>
      <div style={{ 
        fontWeight: 600, 
        marginBottom: 8,
        color: "#92400e"
      }}>
        🔐 Decrypt Permission Required
      </div>
      
      <p style={{ 
        fontSize: 14, 
        marginBottom: 12,
        color: "#78350f"
      }}>
        To claim rewards, you need to grant yourself permission to decrypt your bet. 
        This is a one-time action per market.
      </p>

      {granted ? (
        <div style={{
          padding: 12,
          background: "#22c55e",
          color: "#fff",
          borderRadius: 6,
          fontWeight: 600,
          textAlign: "center"
        }}>
          ✅ Permission Granted! You can now claim rewards.
        </div>
      ) : (
        <button
          onClick={grantPermission}
          disabled={loading || !wallet.connected}
          style={{
            width: "100%",
            padding: 12,
            background: loading || !wallet.connected ? "#ccc" : "#f59e0b",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: loading || !wallet.connected ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: 600
          }}
        >
          {loading ? "Granting Permission..." : "Grant Decrypt Permission"}
        </button>
      )}

      <div style={{
        fontSize: 12,
        marginTop: 8,
        color: "#78350f"
      }}>
        💡 This allows you to decrypt your YES/NO choice when claiming rewards
      </div>
    </div>
  );
}