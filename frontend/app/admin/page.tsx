"use client";

import { useState } from "react";
import InitMarket from "../components/InitMarket";
import SetWinner from "../components/SetWinner";

export default function AdminPage() {
  const [marketId, setMarketId] = useState("");

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Admin Panel</h1>
      
      <InitMarket />
      
      <div style={{ 
        border: "2px solid #000", 
        borderRadius: "12px", 
        padding: "24px",
        marginTop: "30px"
      }}>
        <h3 style={{ marginTop: 0 }}>Settle Market</h3>
        <input
          type="number"
          value={marketId}
          onChange={(e) => setMarketId(e.target.value)}
          placeholder="Enter Market ID"
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            border: "2px solid #000",
            borderRadius: "8px",
            marginBottom: "16px"
          }}
        />
        {marketId && <SetWinner marketId={marketId} />}
      </div>
    </div>
  );
}