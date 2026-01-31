
// "use client";

// import Link from "next/link";

// export default function MarketCard({
//   id,
//   question,
//   deadline,
// }: {
//   id: string;
//   question: string;
//   deadline?: number;
// }) {
//   // Convert Unix timestamp to readable date
//   const getDeadlineText = () => {
//     if (!deadline) return "No deadline set";
    
//     try {
//       // deadline is a Unix timestamp in seconds
//       const deadlineDate = new Date(deadline * 1000);
      
//       // Check if date is valid
//       if (isNaN(deadlineDate.getTime())) {
//         return "Invalid deadline";
//       }
      
//       return deadlineDate.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } catch (error) {
//       console.error("Error formatting deadline:", error);
//       return "Invalid deadline";
//     }
//   };

//   return (
//     <Link href={`/market/${id}`} style={{ textDecoration: "none", color: "black" }}>
//       <div
//         style={{
//           border: "2px solid black",
//           borderRadius: 10,
//           padding: 16,
//           height: 200,
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "space-between",
//         }}
//       >
//         <div>
//           <strong>{question}</strong>
//           <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
//             Deadline: {getDeadlineText()}
//           </div>
//         </div>

//         <div style={{ display: "flex", gap: 12 }}>
//           <div style={{ border: "1px solid black", padding: "8px 16px", borderRadius: "6px" }}>
//             YES
//           </div>
//           <div style={{ border: "1px solid black", padding: "8px 16px", borderRadius: "6px" }}>
//             NO
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// }
"use client";

import Link from "next/link";

export default function MarketCard({
  id,
  question,
  deadline,
}: {
  id: string;
  question: string;
  deadline?: number;
}) {
  const getDeadlineText = () => {
    if (!deadline) return "No deadline set";
    
    try {
      const deadlineDate = new Date(deadline * 1000);
      if (isNaN(deadlineDate.getTime())) return "Invalid deadline";
      
      const now = new Date();
      const diff = deadlineDate.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (diff < 0) return "Ended";
      if (days > 0) return `${days}d ${hours}h left`;
      if (hours > 0) return `${hours}h left`;
      return "Ending soon";
    } catch (error) {
      return "Invalid deadline";
    }
  };

  const isActive = deadline && deadline * 1000 > Date.now();

  return (
    <Link 
      href={`/market/${id}`} 
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(28, 31, 46, 0.8) 100%)',
          border: '1px solid var(--border-primary)',
          borderRadius: '16px',
          padding: '0',
          height: '320px',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--brand-primary)';
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-primary)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '120px',
          background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Header Section */}
        <div style={{ 
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border-secondary)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Market #{id}
            </div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: isActive 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)'
                : 'rgba(107, 114, 128, 0.15)',
              color: isActive ? 'var(--yes-color)' : 'var(--text-muted)',
              border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`,
            }}>
              {isActive && (
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--yes-color)',
                  boxShadow: '0 0 8px var(--yes-color)',
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
              )}
              {isActive ? 'Live' : 'Ended'}
            </span>
          </div>
          
          <h3 style={{
            fontSize: '17px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            lineHeight: '1.5',
            marginBottom: '0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '51px',
          }}>
            {question}
          </h3>
        </div>

        {/* Stats Section */}
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.15)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ fontWeight: '600' }}>{getDeadlineText()}</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span style={{ fontWeight: '600' }}>$2.4K Vol</span>
          </div>
        </div>

        {/* Probability Bar */}
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{
            display: 'flex',
            height: '6px',
            borderRadius: '8px',
            overflow: 'hidden',
            background: 'var(--bg-tertiary)',
            marginBottom: '16px',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
          }}>
            <div style={{
              width: '50%',
              background: 'linear-gradient(90deg, var(--yes-color) 0%, var(--yes-hover) 100%)',
              transition: 'width 0.3s ease',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '40%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 100%)',
              }} />
            </div>
            <div style={{
              width: '50%',
              background: 'linear-gradient(90deg, var(--no-hover) 0%, var(--no-color) 100%)',
              transition: 'width 0.3s ease',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '40%',
                height: '100%',
                background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)',
              }} />
            </div>
          </div>

          {/* Outcome Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{
              flex: 1,
              padding: '16px 12px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)',
              border: '1.5px solid rgba(16, 185, 129, 0.25)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)',
                pointerEvents: 'none',
              }} />
              <div style={{
                fontSize: '11px',
                color: 'var(--yes-color)',
                fontWeight: '700',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                YES
              </div>
              <div style={{
                fontSize: '24px',
                color: 'var(--yes-color)',
                fontWeight: '800',
                letterSpacing: '-0.5px',
              }}>
                50%
              </div>
            </div>
            <div style={{
              flex: 1,
              padding: '16px 12px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%)',
              border: '1.5px solid rgba(239, 68, 68, 0.25)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)',
                pointerEvents: 'none',
              }} />
              <div style={{
                fontSize: '11px',
                color: 'var(--no-color)',
                fontWeight: '700',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                NO
              </div>
              <div style={{
                fontSize: '24px',
                color: 'var(--no-color)',
                fontWeight: '800',
                letterSpacing: '-0.5px',
              }}>
                50%
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}