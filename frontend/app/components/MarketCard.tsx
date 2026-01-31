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
  // Convert Unix timestamp to readable date
  const getDeadlineText = () => {
    if (!deadline) return "No deadline set";
    
    try {
      const deadlineDate = new Date(deadline * 1000);
      if (isNaN(deadlineDate.getTime())) return "Invalid deadline";
      
      return deadlineDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting deadline:", error);
      return "Invalid deadline";
    }
  };

  return (
    <Link href={`/market/${id}`} className="block group">
      <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-[#2C3240] bg-[#1A1D27] p-5 transition-all duration-200 hover:border-slate-500 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
        
        {/* Top Section: Icon & Question */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            {/* Placeholder Icon (Polymarket uses market icons) */}
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 opacity-80" />
            
            {/* Badge (Optional) */}
            {deadline && deadline * 1000 > Date.now() ? (
                 <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-500">
                   <span className="relative flex h-2 w-2">
                     <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                     <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                   </span>
                   Live
                 </span>
            ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ended</span>
            )}
          </div>

          <h3 className="line-clamp-3 text-lg font-medium leading-snug text-slate-100 group-hover:text-blue-400 transition-colors">
            {question}
          </h3>
        </div>

        {/* Bottom Section: Data */}
        <div className="mt-6 border-t border-[#2C3240] pt-4">
           <div className="flex items-center justify-between text-xs text-slate-400">
             <div className="flex items-center gap-2">
                <span>Ends {getDeadlineText()}</span>
             </div>
           </div>
           
           {/* Volume/Outcome Simulation Bar (Visual only for now) */}
           <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-[#2C3240]">
              <div className="w-1/2 bg-emerald-500/80"></div>
              <div className="w-1/2 bg-red-500/80"></div>
           </div>
           <div className="mt-1 flex justify-between text-[10px] font-bold text-slate-500 uppercase">
             <span>Yes</span>
             <span>No</span>
           </div>
        </div>
      </div>
    </Link>
  );
}