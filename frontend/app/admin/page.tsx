// "use client";

// import { useState } from "react";
// import InitMarket from "../components/InitMarket";
// import SetWinner from "../components/SetWinner";

// export default function AdminPage() {
//   const [marketId, setMarketId] = useState("");

//   return (
//     <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
//       <h1>Admin Panel</h1>
      
//       <InitMarket />
      
//       <div style={{ 
//         border: "2px solid #000", 
//         borderRadius: "12px", 
//         padding: "24px",
//         marginTop: "30px"
//       }}>
//         <h3 style={{ marginTop: 0 }}>Settle Market</h3>
//         <input
//           type="number"
//           value={marketId}
//           onChange={(e) => setMarketId(e.target.value)}
//           placeholder="Enter Market ID"
//           style={{
//             width: "100%",
//             padding: "12px",
//             fontSize: "16px",
//             border: "2px solid #000",
//             borderRadius: "8px",
//             marginBottom: "16px"
//           }}
//         />
//         {marketId && <SetWinner marketId={marketId} />}
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import InitMarket from "../components/InitMarket";
import SetWinner from "../components/SetWinner";

export default function AdminPage() {
  const [marketId, setMarketId] = useState("");
  const [activeTab, setActiveTab] = useState<"create" | "settle">("create");

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", animation: 'slideUp 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{
          fontSize: "32px",
          fontWeight: "700",
          marginBottom: "8px",
          background: "linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Admin Panel
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Manage prediction markets and settlements
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: "flex",
        gap: "8px",
        marginBottom: "32px",
        padding: "4px",
        background: "var(--bg-secondary)",
        borderRadius: "10px",
        border: "1px solid var(--border-primary)",
      }}>
        {[
          { id: "create", label: "Create Market", icon: "➕" },
          { id: "settle", label: "Settle Market", icon: "⚖️" },
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
      {activeTab === "create" ? (
        <InitMarket />
      ) : (
        <div style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-primary)",
          borderRadius: "16px",
          padding: "32px",
        }}>
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
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}>
              ⚖️
            </div>
            <div>
              <h3 style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "var(--text-primary)",
                marginBottom: "4px",
              }}>
                Settle Market
              </h3>
              <p style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}>
                Declare the winning outcome for a market
              </p>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "var(--text-primary)",
            }}>
              Market ID
            </label>
            <input
              type="number"
              value={marketId}
              onChange={(e) => setMarketId(e.target.value)}
              placeholder="Enter Market ID to settle"
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "14px",
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-primary)",
                borderRadius: "8px",
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
            />
          </div>

          {marketId && <SetWinner marketId={marketId} />}
          
          {!marketId && (
            <div style={{
              padding: "24px",
              borderRadius: "12px",
              background: "rgba(99, 102, 241, 0.05)",
              border: "1px solid rgba(99, 102, 241, 0.1)",
              textAlign: "center",
            }}>
              <p style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
              }}>
                Enter a market ID above to settle it
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}