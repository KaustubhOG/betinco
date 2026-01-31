"use client";

import { useState, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { BorshAccountsCoder } from "@coral-xyz/anchor";
import IDL from "../idl/betinco.json";

const PROGRAM_ID = new PublicKey("H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77");
const HELIUS_RPC = "https://devnet.helius-rpc.com/?api-key=921ba1f0-fa17-4803-8417-e8c04743d961";

export default function DebugPage() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState<string>("");

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const connection = new Connection(HELIUS_RPC, "confirmed");
      const accounts = await connection.getProgramAccounts(PROGRAM_ID);
      
      console.log("Total accounts:", accounts.length);
      
      const coder = new BorshAccountsCoder(IDL as any);
      const decodedMarkets: any[] = [];
      let rawDataStr = "";

      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        rawDataStr += `\n\n=== Account ${i} ===\n`;
        rawDataStr += `Pubkey: ${account.pubkey.toBase58()}\n`;
        rawDataStr += `Data length: ${account.account.data.length}\n`;
        rawDataStr += `First 16 bytes: ${account.account.data.slice(0, 16).toString('hex')}\n`;

        try {
          const decoded = coder.decode("Market", account.account.data);
          
          if (decoded) {
            const market = decoded as any;
            
            rawDataStr += `Decoded successfully!\n`;
            rawDataStr += `Market ID: ${market.marketId}\n`;
            rawDataStr += `Question: ${market.question}\n`;
            rawDataStr += `Is Settled: ${market.isSettled}\n`;
            rawDataStr += `Is Settled (raw): ${JSON.stringify(market.isSettled)}\n`;
            rawDataStr += `Winning Outcome: ${JSON.stringify(market.winningOutcome)}\n`;
            
            decodedMarkets.push({
              pubkey: account.pubkey.toBase58(),
              marketId: market.marketId.toString(),
              question: market.question,
              isSettled: market.isSettled,
              isSettledRaw: market.isSettled,
              winningOutcome: market.winningOutcome,
              deadline: market.settlementDeadline?.toNumber?.() || Number(market.settlementDeadline),
            });
          }
        } catch (e: any) {
          rawDataStr += `Failed to decode as Market: ${e.message}\n`;
          
          // Try to decode as BetData
          try {
            const betDecoded = coder.decode("BetData", account.account.data);
            if (betDecoded) {
              rawDataStr += `This is a BetData account\n`;
            }
          } catch (e2) {
            rawDataStr += `Not a BetData account either\n`;
          }
        }
      }

      setMarkets(decodedMarkets);
      setRawData(rawDataStr);
      console.log("Decoded markets:", decodedMarkets);
    } catch (error) {
      console.error("Error:", error);
      setRawData("ERROR: " + JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Debug: Market Data</h1>
      
      <button
        onClick={fetchMarkets}
        disabled={loading}
        style={{
          padding: "12px 24px",
          background: "#000",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: "20px"
        }}
      >
        {loading ? "Loading..." : "Refresh"}
      </button>

      <div style={{ marginBottom: "40px" }}>
        <h2>Decoded Markets ({markets.length})</h2>
        {markets.map((market, i) => (
          <div
            key={i}
            style={{
              border: "2px solid #000",
              padding: "16px",
              marginBottom: "16px",
              borderRadius: "8px",
              background: market.isSettled ? "#dcfce7" : "#fff"
            }}
          >
            <div><strong>Market ID:</strong> {market.marketId}</div>
            <div><strong>Question:</strong> {market.question}</div>
            <div><strong>Is Settled:</strong> {String(market.isSettled)} (type: {typeof market.isSettled})</div>
            <div><strong>Is Settled Raw:</strong> {JSON.stringify(market.isSettledRaw)}</div>
            <div><strong>Winning Outcome:</strong> {JSON.stringify(market.winningOutcome)}</div>
            <div><strong>Deadline:</strong> {new Date(market.deadline * 1000).toLocaleString()}</div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
              <strong>Pubkey:</strong> {market.pubkey}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2>Raw Data</h2>
        <pre style={{
          background: "#f3f4f6",
          padding: "16px",
          borderRadius: "8px",
          overflow: "auto",
          fontSize: "12px"
        }}>
          {rawData}
        </pre>
      </div>
    </div>
  );
}