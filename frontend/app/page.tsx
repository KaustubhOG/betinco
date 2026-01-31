// "use client";

// import { useEffect, useState } from "react";
// import MarketCard from "./components/MarketCard";
// import { fetchAllMarkets, MarketData } from "./lib/fetchMarkets";

// export default function HomePage() {
//   const [markets, setMarkets] = useState<MarketData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     loadMarkets();
//   }, []);

//   const loadMarkets = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       console.log("Fetching markets...");
//       const data = await fetchAllMarkets();
//       console.log("Fetched markets:", data);
//       setMarkets(data);
//     } catch (err: any) {
//       console.error("Failed to load markets:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ textAlign: "center", padding: "40px" }}>
//         <h2>Loading markets...</h2>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{ textAlign: "center", padding: "40px" }}>
//         <h2>Error loading markets</h2>
//         <p>{error}</p>
//         <button onClick={loadMarkets} style={{ marginTop: "20px", padding: "10px 20px" }}>
//           Retry
//         </button>
//       </div>
//     );
//   }

//   if (markets.length === 0) {
//     return (
//       <div style={{ textAlign: "center", padding: "40px" }}>
//         <h2>No markets found</h2>
//         <p>Create your first market in the admin panel</p>
//         <button onClick={loadMarkets} style={{ marginTop: "20px", padding: "10px 20px" }}>
//           Refresh
//         </button>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
//         <h1>Prediction Markets</h1>
//         <button onClick={loadMarkets} style={{ padding: "10px 20px", cursor: "pointer" }}>
//           Refresh
//         </button>
//       </div>

//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
//           gap: 16,
//         }}
//       >
//         {markets.map((m) => (
//           <MarketCard key={m.id} id={m.id} question={m.question} />
//         ))}
//       </div>
//     </>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import MarketCard from "./components/MarketCard";
import { fetchAllMarkets, MarketData } from "./lib/fetchMarkets";

export default function HomePage() {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching markets...");
      const data = await fetchAllMarkets();
      console.log("Fetched markets:", data);
      setMarkets(data);
    } catch (err: any) {
      console.error("Failed to load markets:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500"></div>
        <p className="text-slate-400">Loading markets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-red-500/10 p-4 text-red-500">
          ⚠️
        </div>
        <h2 className="text-xl font-semibold text-white">Error loading markets</h2>
        <p className="max-w-md text-slate-400">{error}</p>
        <button 
          onClick={loadMarkets} 
          className="mt-4 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">All Markets</span>
            <span className="rounded-full bg-[#2C3240] px-2 py-0.5 text-xs font-medium text-slate-400">
                {markets.length}
            </span>
        </div>

        <button
          onClick={loadMarkets}
          className="group flex items-center gap-2 rounded-lg border border-[#2C3240] bg-[#1A1D27] px-3 py-1.5 text-sm font-medium text-slate-300 hover:border-slate-600 hover:text-white transition-all"
        >
          <svg className="h-4 w-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Markets Grid */}
      {markets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2C3240] bg-[#1A1D27]/50 py-20 text-center">
          <p className="text-slate-500">No active markets found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {markets.map((market) => (
            <MarketCard
                key={market.id}
                id={market.id}
                question={market.question}
                deadline={market.deadline}
            />
            ))}
        </div>
      )}
    </div>
  );
}