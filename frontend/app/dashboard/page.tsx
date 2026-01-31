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
      console.log("Loading settled markets...");
      const data = await fetchSettledMarkets();
      console.log("Settled markets loaded:", data);
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
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Please connect your wallet</h2>
        <p style={{ color: "#666", marginTop: "16px" }}>
          Connect your wallet to view and claim rewards from settled markets
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Loading settled markets...</h2>
        <div style={{ marginTop: "20px" }}>
          <div style={{
            width: "50px",
            height: "50px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #000",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto"
          }}></div>
        </div>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Dashboard - Claim Rewards</h1>
        
        <div style={{
          marginTop: "40px",
          padding: "40px",
          border: "2px solid #f59e0b",
          borderRadius: "12px",
          background: "#fffbeb",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
          <h2 style={{ marginTop: 0 }}>No settled markets found</h2>
          <p style={{ color: "#666", marginBottom: "24px" }}>
            Markets must be settled before you can claim rewards.
            Check back after the market deadline has passed and the admin has set the winner.
          </p>
          <button 
            onClick={loadMarkets}
            style={{
              padding: "12px 24px",
              background: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: 600
            }}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const selectedMarket = markets.find(m => m.id === selectedMarketId);

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Dashboard - Claim Rewards</h1>

      <div style={{
        marginBottom: "30px",
        padding: "20px",
        background: "#f0f9ff",
        borderRadius: "12px",
        border: "2px solid #0ea5e9"
      }}>
        <div style={{ fontSize: "14px", color: "#0369a1", marginBottom: "8px" }}>
          <strong>💰 {markets.length}</strong> settled market{markets.length !== 1 ? 's' : ''} available
        </div>
        <div style={{ fontSize: "12px", color: "#075985" }}>
          Select a market below to claim your rewards
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <label style={{ 
          display: "block", 
          marginBottom: "12px", 
          fontWeight: 600,
          fontSize: "16px"
        }}>
          Select Market:
        </label>
        <select
          value={selectedMarketId}
          onChange={(e) => setSelectedMarketId(e.target.value)}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "16px",
            border: "2px solid #000",
            borderRadius: "8px",
            background: "#fff",
            cursor: "pointer"
          }}
        >
          {markets.map((market) => (
            <option key={market.id} value={market.id}>
              Market #{market.id}: {market.question} - Winner: {market.winningOutcome || "Unknown"}
            </option>
          ))}
        </select>
      </div>

      {selectedMarket && (
        <div style={{
          marginBottom: "30px",
          padding: "20px",
          background: "#dcfce7",
          borderRadius: "12px",
          border: "2px solid #22c55e"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
            Selected Market Details
          </h3>
          <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
            <div><strong>Question:</strong> {selectedMarket.question}</div>
            <div><strong>Winner:</strong> {selectedMarket.winningOutcome || "Not set"}</div>
            <div><strong>Deadline:</strong> {new Date(selectedMarket.deadline * 1000).toLocaleString()}</div>
            <div><strong>Status:</strong> <span style={{ color: "#16a34a" }}>✅ SETTLED</span></div>
          </div>
        </div>
      )}

      {selectedMarketId && <ClaimRewards marketId={selectedMarketId} />}

      <button 
        onClick={loadMarkets}
        disabled={loading}
        style={{
          marginTop: "30px",
          padding: "12px 24px",
          background: loading ? "#9ca3af" : "#3b82f6",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "16px",
          fontWeight: 600
        }}
      >
        {loading ? "Refreshing..." : "Refresh Markets"}
      </button>
    </div>
  );
}