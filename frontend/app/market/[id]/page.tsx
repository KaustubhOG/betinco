// "use client";

// import { useParams } from "next/navigation";
// import BetBox from "@/app/components/BetBox";
// import SetupWSOL from "@/app/components/SetupWSOL";
// import { useState } from "react";

// export default function MarketDetailPage() {
//   const params = useParams();
//   const marketId = params?.id as string;
//   const [showBet, setShowBet] = useState(true);

//   if (!marketId) {
//     return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;
//   }

//   return (
//     <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
//       <h1>Market #{marketId}</h1>

//       <div style={{ marginBottom: "30px" }}>
//         <button
//           onClick={() => setShowBet(!showBet)}
//           style={{
//             padding: "12px 24px",
//             background: "#000",
//             color: "#fff",
//             border: "none",
//             borderRadius: "8px",
//             cursor: "pointer",
//             fontSize: "16px",
//             fontWeight: 600,
//             marginRight: "12px"
//           }}
//         >
//           {showBet ? "Setup WSOL" : "Place Bet"}
//         </button>
//       </div>

//       {showBet ? (
//         <BetBox marketId={marketId} />
//       ) : (
//         <SetupWSOL />
//       )}
//     </div>
//   );
// }
"use client";

import { useParams } from "next/navigation";
import BetBox from "@/app/components/BetBox";
import SetupWSOL from "@/app/components/SetupWSOL";
import GrantPermission from "@/app/components/GrantPermission";
import ClaimRewards from "@/app/components/ClaimRewards";
import { useState, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

const HELIUS_RPC = "https://devnet.helius-rpc.com/?api-key=921ba1f0-fa17-4803-8417-e8c04743d961";
const PROGRAM_ID = new PublicKey("H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77");

interface MarketData {
  isSettled: boolean;
  winningOutcome?: number;
  description?: string;
}

export default function MarketDetailPage() {
  const params = useParams();
  const marketId = params?.id as string;
  const [showBet, setShowBet] = useState(true);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (marketId) {
      loadMarketData();
    }
  }, [marketId]);

  const loadMarketData = async () => {
    try {
      const connection = new Connection(HELIUS_RPC, "confirmed");
      const marketIdNum = parseInt(marketId);
      const marketIdBuf = Buffer.alloc(4);
      marketIdBuf.writeUInt32LE(marketIdNum, 0);

      const [marketPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("market"), marketIdBuf],
        PROGRAM_ID
      );

      const accountInfo = await connection.getAccountInfo(marketPda);
      if (!accountInfo) {
        console.error("Market not found");
        setLoading(false);
        return;
      }

      const data = accountInfo.data;
      let offset = 8; // Skip discriminator

      // Parse market data
      offset += 4; // market_id
      offset += 32; // creator
      offset += 32; // collateral_mint
      offset += 32; // collateral_vault
      offset += 8; // settlement_deadline
      
      const isSettled = data[offset] === 1;
      offset += 1;
      
      let winningOutcome: number | undefined;
      const hasOutcome = data[offset] === 1;
      offset += 1;
      if (hasOutcome) {
        winningOutcome = data[offset];
      }

      setMarketData({
        isSettled,
        winningOutcome,
        description: `Market #${marketId}`
      });
    } catch (e) {
      console.error("Error loading market:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!marketId) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Market #{marketId}</h1>
      
      {loading ? (
        <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
          Loading market data...
        </div>
      ) : marketData && (
        <div style={{ 
          padding: 12, 
          background: marketData.isSettled ? "#dcfce7" : "#e0e7ff",
          borderRadius: 8,
          marginBottom: 20,
          fontSize: 14,
          fontWeight: 600
        }}>
          {marketData.isSettled ? (
            <>
              ✅ Market Settled - Winner: {marketData.winningOutcome === 0 ? "YES" : "NO"}
            </>
          ) : (
            <>
              🔴 Market Active - Place your bets!
            </>
          )}
        </div>
      )}

      <div style={{ marginBottom: "30px" }}>
        <button
          onClick={() => setShowBet(!showBet)}
          style={{
            padding: "12px 24px",
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: 600,
            marginRight: "12px"
          }}
        >
          {showBet ? "Setup WSOL" : "Place Bet"}
        </button>
      </div>

      {/* Betting Section */}
      {showBet ? (
        <BetBox marketId={marketId} />
      ) : (
        <SetupWSOL />
      )}

      {/* Claims Section - Only show if market is settled */}
      {marketData?.isSettled && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ marginBottom: 16 }}>🎁 Claim Rewards</h2>
          
          <div style={{
            border: "2px solid #000",
            borderRadius: 12,
            padding: 24,
            background: "#fff"
          }}>
            <div style={{
              marginBottom: 16,
              padding: 12,
              background: "#eff6ff",
              borderRadius: 8,
              fontSize: 14
            }}>
              <strong>📋 Steps to claim:</strong>
              <ol style={{ marginBottom: 0, marginTop: 8, paddingLeft: 20 }}>
                <li>First, grant yourself decrypt permission (one-time)</li>
                <li>Then, claim your rewards</li>
              </ol>
            </div>

            {/* Step 1: Grant Permission */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>
                Step 1: Grant Decrypt Permission
              </h3>
              <GrantPermission marketId={marketId} />
            </div>

            {/* Step 2: Claim Rewards */}
            <div>
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>
                Step 2: Claim Your Rewards
              </h3>
              <ClaimRewards marketId={marketId} />
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div style={{
        marginTop: 30,
        padding: 20,
        background: "#f9fafb",
        borderRadius: 8,
        fontSize: 14
      }}>
        <h3 style={{ marginTop: 0, fontSize: 16 }}>💡 How it works</h3>
        <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
          <li><strong>Place Bet:</strong> Your YES/NO choice is encrypted with Inco FHE</li>
          <li><strong>Wait for Settlement:</strong> Market creator settles the market</li>
          <li><strong>Grant Permission:</strong> Allow yourself to decrypt your bet (one-time)</li>
          <li><strong>Claim Rewards:</strong> Decrypt your bet and claim if you won!</li>
        </ul>
      </div>
    </div>
  );
}