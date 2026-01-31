// "use client";

// import { useState, useEffect } from "react";
// import { useWallet } from "@solana/wallet-adapter-react";
// import ClaimRewards from "../components/ClaimRewards";
// import { fetchSettledMarkets, MarketData } from "../lib/fetchMarkets";

// export default function DashboardPage() {
//   const wallet = useWallet();
//   const [markets, setMarkets] = useState<MarketData[]>([]);
//   const [selectedMarketId, setSelectedMarketId] = useState<string>("");
//   const [loading, setLoading] = useState(true);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     if (mounted) {
//       loadMarkets();
//     }
//   }, [mounted]);

//   const loadMarkets = async () => {
//     setLoading(true);
//     try {
//       console.log("Loading settled markets...");
//       const data = await fetchSettledMarkets();
//       console.log("Settled markets loaded:", data);
//       setMarkets(data);
//       if (data.length > 0) {
//         setSelectedMarketId(data[0].id);
//       }
//     } catch (error) {
//       console.error("Error loading markets:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!mounted) return null;

//   if (!wallet.publicKey) {
//     return (
//       <div style={{ padding: "40px", textAlign: "center" }}>
//         <h2>Please connect your wallet</h2>
//         <p style={{ color: "#666", marginTop: "16px" }}>
//           Connect your wallet to view and claim rewards from settled markets
//         </p>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div style={{ padding: "40px", textAlign: "center" }}>
//         <h2>Loading settled markets...</h2>
//         <div style={{ marginTop: "20px" }}>
//           <div style={{
//             width: "50px",
//             height: "50px",
//             border: "4px solid #f3f3f3",
//             borderTop: "4px solid #000",
//             borderRadius: "50%",
//             animation: "spin 1s linear infinite",
//             margin: "0 auto"
//           }}></div>
//         </div>
//       </div>
//     );
//   }

//   if (markets.length === 0) {
//     return (
//       <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
//         <h1>Dashboard - Claim Rewards</h1>
        
//         <div style={{
//           marginTop: "40px",
//           padding: "40px",
//           border: "2px solid #f59e0b",
//           borderRadius: "12px",
//           background: "#fffbeb",
//           textAlign: "center"
//         }}>
//           <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
//           <h2 style={{ marginTop: 0 }}>No settled markets found</h2>
//           <p style={{ color: "#666", marginBottom: "24px" }}>
//             Markets must be settled before you can claim rewards.
//             Check back after the market deadline has passed and the admin has set the winner.
//           </p>
//           <button 
//             onClick={loadMarkets}
//             style={{
//               padding: "12px 24px",
//               background: "#000",
//               color: "#fff",
//               border: "none",
//               borderRadius: "8px",
//               cursor: "pointer",
//               fontSize: "16px",
//               fontWeight: 600
//             }}
//           >
//             Refresh
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const selectedMarket = markets.find(m => m.id === selectedMarketId);

//   return (
//     <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
//       <h1>Dashboard - Claim Rewards</h1>

//       <div style={{
//         marginBottom: "30px",
//         padding: "20px",
//         background: "#f0f9ff",
//         borderRadius: "12px",
//         border: "2px solid #0ea5e9"
//       }}>
//         <div style={{ fontSize: "14px", color: "#0369a1", marginBottom: "8px" }}>
//           <strong>💰 {markets.length}</strong> settled market{markets.length !== 1 ? 's' : ''} available
//         </div>
//         <div style={{ fontSize: "12px", color: "#075985" }}>
//           Select a market below to claim your rewards
//         </div>
//       </div>

//       <div style={{ marginBottom: "30px" }}>
//         <label style={{ 
//           display: "block", 
//           marginBottom: "12px", 
//           fontWeight: 600,
//           fontSize: "16px"
//         }}>
//           Select Market:
//         </label>
//         <select
//           value={selectedMarketId}
//           onChange={(e) => setSelectedMarketId(e.target.value)}
//           style={{
//             width: "100%",
//             padding: "16px",
//             fontSize: "16px",
//             border: "2px solid #000",
//             borderRadius: "8px",
//             background: "#fff",
//             cursor: "pointer"
//           }}
//         >
//           {markets.map((market) => (
//             <option key={market.id} value={market.id}>
//               Market #{market.id}: {market.question} - Winner: {market.winningOutcome || "Unknown"}
//             </option>
//           ))}
//         </select>
//       </div>

//       {selectedMarket && (
//         <div style={{
//           marginBottom: "30px",
//           padding: "20px",
//           background: "#dcfce7",
//           borderRadius: "12px",
//           border: "2px solid #22c55e"
//         }}>
//           <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
//             Selected Market Details
//           </h3>
//           <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
//             <div><strong>Question:</strong> {selectedMarket.question}</div>
//             <div><strong>Winner:</strong> {selectedMarket.winningOutcome || "Not set"}</div>
//             <div><strong>Deadline:</strong> {new Date(selectedMarket.deadline * 1000).toLocaleString()}</div>
//             <div><strong>Status:</strong> <span style={{ color: "#16a34a" }}>✅ SETTLED</span></div>
//           </div>
//         </div>
//       )}

//       {selectedMarketId && <ClaimRewards marketId={selectedMarketId} />}

//       <button 
//         onClick={loadMarkets}
//         disabled={loading}
//         style={{
//           marginTop: "30px",
//           padding: "12px 24px",
//           background: loading ? "#9ca3af" : "#3b82f6",
//           color: "#fff",
//           border: "none",
//           borderRadius: "8px",
//           cursor: loading ? "not-allowed" : "pointer",
//           fontSize: "16px",
//           fontWeight: 600
//         }}
//       >
//         {loading ? "Refreshing..." : "Refresh Markets"}
//       </button>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import ClaimRewards from "../components/ClaimRewards";
import { fetchSettledMarkets, MarketData } from "../lib/fetchMarkets";

export default function DashboardPage() {
  const wallet = useWallet();
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadMarkets();
    }
  }, [mounted]);

  const loadMarkets = async () => {
    setLoading(true);
    try {
      const data = await fetchSettledMarkets();
      setMarkets(data);
      if (data.length > 0) {
        setSelectedMarketId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading markets:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (!wallet.publicKey) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "24px",
      }}>
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "40px",
        }}>
          👛
        </div>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}>
            Connect Your Wallet
          </h2>
          <p style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            lineHeight: "1.6",
          }}>
            Connect your wallet to view and claim rewards from settled markets
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "16px",
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid var(--border-primary)",
          borderTop: "4px solid var(--brand-primary)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Loading settled markets...
        </p>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{
            fontSize: "32px",
            fontWeight: "700",
            marginBottom: "8px",
            background: "linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Claim rewards from settled markets
          </p>
        </div>

        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 32px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-primary)",
          borderRadius: "16px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "64px", marginBottom: "24px" }}>🔍</div>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}>
            No settled markets found
          </h2>
          <p style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            marginBottom: "32px",
            maxWidth: "400px",
            lineHeight: "1.6",
          }}>
            Markets must be settled before you can claim rewards. Check back after the market deadline has passed and the admin has declared a winner.
          </p>
          <button
            onClick={loadMarkets}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              background: "var(--brand-primary)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--brand-hover)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--brand-primary)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const selectedMarket = markets.find(m => m.id === selectedMarketId);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", animation: 'slideUp 0.4s ease-out' }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "32px",
      }}>
        <div>
          <h1 style={{
            fontSize: "32px",
            fontWeight: "700",
            marginBottom: "8px",
            background: "linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            {markets.length} settled {markets.length === 1 ? "market" : "markets"} available
          </p>
        </div>
        <button
          onClick={loadMarkets}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            background: loading ? "var(--bg-hover)" : "var(--bg-tertiary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            opacity: loading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = "var(--bg-hover)";
              e.currentTarget.style.borderColor = "var(--brand-primary)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = "var(--bg-tertiary)";
              e.currentTarget.style.borderColor = "var(--border-primary)";
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stats Card */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "32px",
      }}>
        <div style={{
          padding: "20px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-primary)",
          borderRadius: "12px",
        }}>
          <div style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            marginBottom: "8px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            Settled Markets
          </div>
          <div style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "var(--text-primary)",
          }}>
            {markets.length}
          </div>
        </div>
      </div>

      {/* Market Selector */}
      <div style={{ marginBottom: "32px" }}>
        <label style={{
          display: "block",
          marginBottom: "12px",
          fontSize: "14px",
          fontWeight: "600",
          color: "var(--text-primary)",
        }}>
          Select Market to Claim
        </label>
        <select
          value={selectedMarketId}
          onChange={(e) => setSelectedMarketId(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            fontSize: "14px",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "10px",
            cursor: "pointer",
            outline: "none",
            transition: "all 0.2s ease",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--brand-primary)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border-primary)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {markets.map((market) => (
            <option key={market.id} value={market.id}>
              Market #{market.id}: {market.question} - Winner: {market.winningOutcome || "Unknown"}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Market Details */}
      {selectedMarket && (
        <div style={{
          padding: "24px",
          background: "rgba(16, 185, 129, 0.05)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          borderRadius: "12px",
          marginBottom: "32px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--success)",
            }} />
            <h3 style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "var(--text-primary)",
            }}>
              Selected Market Details
            </h3>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            fontSize: "14px",
          }}>
            <div>
              <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>Question</div>
              <div style={{ color: "var(--text-primary)", fontWeight: "500" }}>{selectedMarket.question}</div>
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>Winner</div>
              <div style={{
                color: "var(--success)",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                {selectedMarket.winningOutcome || "Not set"}
              </div>
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>Status</div>
              <div style={{
                color: "var(--success)",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                ✓ SETTLED
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Claim Component */}
      {selectedMarketId && <ClaimRewards marketId={selectedMarketId} />}
    </div>
  );
}