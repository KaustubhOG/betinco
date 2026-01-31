
// "use client";

// import { useParams } from "next/navigation";
// import BetBox from "@/app/components/BetBox";
// import SetupWSOL from "@/app/components/SetupWSOL";
// import GrantPermission from "@/app/components/GrantPermission";
// import ClaimRewards from "@/app/components/ClaimRewards";
// import { useState, useEffect } from "react";
// import { Connection, PublicKey } from "@solana/web3.js";

// const HELIUS_RPC = "https://devnet.helius-rpc.com/?api-key=921ba1f0-fa17-4803-8417-e8c04743d961";
// const PROGRAM_ID = new PublicKey("H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77");

// interface MarketData {
//   isSettled: boolean;
//   winningOutcome?: number;
//   description?: string;
// }

// export default function MarketDetailPage() {
//   const params = useParams();
//   const marketId = params?.id as string;
//   const [showBet, setShowBet] = useState(true);
//   const [marketData, setMarketData] = useState<MarketData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (marketId) {
//       loadMarketData();
//     }
//   }, [marketId]);

//   const loadMarketData = async () => {
//     try {
//       const connection = new Connection(HELIUS_RPC, "confirmed");
//       const marketIdNum = parseInt(marketId);
//       const marketIdBuf = Buffer.alloc(4);
//       marketIdBuf.writeUInt32LE(marketIdNum, 0);

//       const [marketPda] = PublicKey.findProgramAddressSync(
//         [Buffer.from("market"), marketIdBuf],
//         PROGRAM_ID
//       );

//       const accountInfo = await connection.getAccountInfo(marketPda);
//       if (!accountInfo) {
//         console.error("Market not found");
//         setLoading(false);
//         return;
//       }

//       const data = accountInfo.data;
//       let offset = 8; // Skip discriminator

//       // Parse market data
//       offset += 4; // market_id
//       offset += 32; // creator
//       offset += 32; // collateral_mint
//       offset += 32; // collateral_vault
//       offset += 8; // settlement_deadline
      
//       const isSettled = data[offset] === 1;
//       offset += 1;
      
//       let winningOutcome: number | undefined;
//       const hasOutcome = data[offset] === 1;
//       offset += 1;
//       if (hasOutcome) {
//         winningOutcome = data[offset];
//       }

//       setMarketData({
//         isSettled,
//         winningOutcome,
//         description: `Market #${marketId}`
//       });
//     } catch (e) {
//       console.error("Error loading market:", e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!marketId) {
//     return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;
//   }

//   return (
//     <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
//       <h1 style={{ marginBottom: 8 }}>Market #{marketId}</h1>
      
//       {loading ? (
//         <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
//           Loading market data...
//         </div>
//       ) : marketData && (
//         <div style={{ 
//           padding: 12, 
//           background: marketData.isSettled ? "#dcfce7" : "#e0e7ff",
//           borderRadius: 8,
//           marginBottom: 20,
//           fontSize: 14,
//           fontWeight: 600
//         }}>
//           {marketData.isSettled ? (
//             <>
//               ✅ Market Settled - Winner: {marketData.winningOutcome === 0 ? "YES" : "NO"}
//             </>
//           ) : (
//             <>
//               🔴 Market Active - Place your bets!
//             </>
//           )}
//         </div>
//       )}

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

//       {/* Betting Section */}
//       {showBet ? (
//         <BetBox marketId={marketId} />
//       ) : (
//         <SetupWSOL />
//       )}

//       {/* Claims Section - Only show if market is settled */}
//       {marketData?.isSettled && (
//         <div style={{ marginTop: 40 }}>
//           <h2 style={{ marginBottom: 16 }}>🎁 Claim Rewards</h2>
          
//           <div style={{
//             border: "2px solid #000",
//             borderRadius: 12,
//             padding: 24,
//             background: "#fff"
//           }}>
//             <div style={{
//               marginBottom: 16,
//               padding: 12,
//               background: "#eff6ff",
//               borderRadius: 8,
//               fontSize: 14
//             }}>
//               <strong>📋 Steps to claim:</strong>
//               <ol style={{ marginBottom: 0, marginTop: 8, paddingLeft: 20 }}>
//                 <li>First, grant yourself decrypt permission (one-time)</li>
//                 <li>Then, claim your rewards</li>
//               </ol>
//             </div>

//             {/* Step 1: Grant Permission */}
//             <div style={{ marginBottom: 20 }}>
//               <h3 style={{ fontSize: 16, marginBottom: 12 }}>
//                 Step 1: Grant Decrypt Permission
//               </h3>
//               <GrantPermission marketId={marketId} />
//             </div>

//             {/* Step 2: Claim Rewards */}
//             <div>
//               <h3 style={{ fontSize: 16, marginBottom: 12 }}>
//                 Step 2: Claim Your Rewards
//               </h3>
//               <ClaimRewards marketId={marketId} />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Info Section */}
//       <div style={{
//         marginTop: 30,
//         padding: 20,
//         background: "#f9fafb",
//         borderRadius: 8,
//         fontSize: 14
//       }}>
//         <h3 style={{ marginTop: 0, fontSize: 16 }}>💡 How it works</h3>
//         <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
//           <li><strong>Place Bet:</strong> Your YES/NO choice is encrypted with Inco FHE</li>
//           <li><strong>Wait for Settlement:</strong> Market creator settles the market</li>
//           <li><strong>Grant Permission:</strong> Allow yourself to decrypt your bet (one-time)</li>
//           <li><strong>Claim Rewards:</strong> Decrypt your bet and claim if you won!</li>
//         </ul>
//       </div>
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
  const [activeTab, setActiveTab] = useState<"bet" | "setup">("bet");
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
      let offset = 8;
      offset += 4;
      offset += 32;
      offset += 32;
      offset += 32;
      offset += 8;
      
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
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", animation: 'slideUp 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
        }}>
          <button
            onClick={() => window.history.back()}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-hover)";
              e.currentTarget.style.borderColor = "var(--brand-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-secondary)";
              e.currentTarget.style.borderColor = "var(--border-primary)";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 style={{
              fontSize: "32px",
              fontWeight: "700",
              background: "linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Market #{marketId}
            </h1>
          </div>
        </div>
        
        {loading ? (
          <div style={{
            padding: "12px 16px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "8px",
            fontSize: "14px",
            color: "var(--text-secondary)",
          }}>
            Loading market data...
          </div>
        ) : marketData && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "600",
            background: marketData.isSettled ? "rgba(16, 185, 129, 0.1)" : "rgba(99, 102, 241, 0.1)",
            border: `1px solid ${marketData.isSettled ? "rgba(16, 185, 129, 0.2)" : "rgba(99, 102, 241, 0.2)"}`,
            color: marketData.isSettled ? "var(--success)" : "var(--brand-primary)",
          }}>
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: marketData.isSettled ? "var(--success)" : "var(--brand-primary)",
            }} />
            {marketData.isSettled ? (
              <>Settled - Winner: {marketData.winningOutcome === 0 ? "YES" : "NO"}</>
            ) : (
              <>Active - Place your bets!</>
            )}
          </div>
        )}
      </div>

      {/* Betting Section */}
      {!marketData?.isSettled && (
        <div style={{ marginBottom: "40px" }}>
          {/* Tab Navigation */}
          <div style={{
            display: "flex",
            gap: "8px",
            marginBottom: "24px",
            padding: "4px",
            background: "var(--bg-secondary)",
            borderRadius: "10px",
            border: "1px solid var(--border-primary)",
          }}>
            {[
              { id: "bet", label: "Place Bet", icon: "🎲" },
              { id: "setup", label: "Setup WSOL", icon: "⚙️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: activeTab === tab.id ? "var(--brand-primary)" : "transparent",
                  color: activeTab === tab.id ? "white" : "var(--text-secondary)",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = "var(--bg-hover)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "bet" ? <BetBox marketId={marketId} /> : <SetupWSOL />}
        </div>
      )}

      {/* Claims Section - Only show if market is settled */}
      {marketData?.isSettled && (
        <div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}>
              🎁
            </div>
            <div>
              <h2 style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "var(--text-primary)",
                marginBottom: "4px",
              }}>
                Claim Rewards
              </h2>
              <p style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}>
                This market has been settled. Claim your rewards if you won!
              </p>
            </div>
          </div>

          <div style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "16px",
            padding: "32px",
          }}>
            <div style={{
              marginBottom: "24px",
              padding: "16px",
              background: "rgba(99, 102, 241, 0.05)",
              border: "1px solid rgba(99, 102, 241, 0.1)",
              borderRadius: "12px",
              fontSize: "14px",
            }}>
              <div style={{
                fontWeight: "600",
                color: "var(--text-primary)",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <span>📋</span>
                Steps to claim rewards
              </div>
              <ol style={{
                marginBottom: 0,
                paddingLeft: "24px",
                color: "var(--text-secondary)",
                lineHeight: "1.8",
              }}>
                <li>First, grant yourself decrypt permission (one-time action)</li>
                <li>Then, claim your rewards if you bet on the winning side</li>
              </ol>
            </div>

            {/* Step 1: Grant Permission */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-primary)",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "var(--brand-primary)",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "700",
                }}>
                  1
                </span>
                Grant Decrypt Permission
              </div>
              <GrantPermission marketId={marketId} />
            </div>

            {/* Step 2: Claim Rewards */}
            <div>
              <div style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-primary)",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "var(--success)",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "700",
                }}>
                  2
                </span>
                Claim Your Rewards
              </div>
              <ClaimRewards marketId={marketId} />
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div style={{
        marginTop: "40px",
        padding: "24px",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-primary)",
        borderRadius: "12px",
        fontSize: "14px",
      }}>
        <h3 style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "var(--text-primary)",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span>💡</span>
          How it works
        </h3>
        <ul style={{
          marginBottom: 0,
          paddingLeft: "24px",
          color: "var(--text-secondary)",
          lineHeight: "1.8",
        }}>
          <li><strong style={{ color: "var(--text-primary)" }}>Place Bet:</strong> Your YES/NO choice is encrypted with Inco FHE technology</li>
          <li><strong style={{ color: "var(--text-primary)" }}>Wait for Settlement:</strong> Market creator declares the winning outcome</li>
          <li><strong style={{ color: "var(--text-primary)" }}>Grant Permission:</strong> Allow yourself to decrypt your bet (one-time action)</li>
          <li><strong style={{ color: "var(--text-primary)" }}>Claim Rewards:</strong> Decrypt your bet and claim if you won!</li>
        </ul>
      </div>
    </div>
  );
}