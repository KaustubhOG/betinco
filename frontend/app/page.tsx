
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
//           <MarketCard key={m.id} id={m.id} question={m.question} deadline={m.deadline} />
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
      const data = await fetchAllMarkets();
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '16px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid var(--border-primary)',
          borderTop: '4px solid var(--brand-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Loading markets...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '20px',
      }}>
        <div style={{
          padding: '24px',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          maxWidth: '500px',
          textAlign: 'center',
        }}>
          <h2 style={{ color: 'var(--error)', marginBottom: '12px', fontSize: '20px' }}>
            Error loading markets
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            {error}
          </p>
          <button
            onClick={loadMarkets}
            style={{
              padding: '10px 24px',
              background: 'var(--brand-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--brand-hover)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--brand-primary)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '20px',
      }}>
        <div style={{
          padding: '48px',
          borderRadius: '16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          maxWidth: '500px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '24px' }}>
            No markets found
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            Create your first prediction market in the admin panel to get started
          </p>
          <button
            onClick={loadMarkets}
            style={{
              padding: '10px 24px',
              background: 'var(--brand-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--brand-hover)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--brand-primary)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'slideUp 0.4s ease-out' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Prediction Markets
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {markets.length} active {markets.length === 1 ? 'market' : 'markets'}
          </p>
        </div>
        <button
          onClick={loadMarkets}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover)';
            e.currentTarget.style.borderColor = 'var(--brand-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-tertiary)';
            e.currentTarget.style.borderColor = 'var(--border-primary)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Markets Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '20px',
      }}>
        {markets.map((m) => (
          <MarketCard
            key={m.id}
            id={m.id}
            question={m.question}
            deadline={m.deadline}
          />
        ))}
      </div>
    </div>
  );
}