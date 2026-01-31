
// "use client";

// import { useState } from "react";
// import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
// import {
//   Connection,
//   PublicKey,
//   SystemProgram,
//   Transaction,
//   TransactionInstruction,
// } from "@solana/web3.js";
// import { AnchorProvider } from "@coral-xyz/anchor";
// import {
//   getAssociatedTokenAddressSync,
//   createAssociatedTokenAccountInstruction,
//   createSyncNativeInstruction,
//   TOKEN_PROGRAM_ID,
//   NATIVE_MINT,
// } from "@solana/spl-token";
// import { Buffer } from "buffer";
// import { encryptBetData } from "../lib/inco";

// const PROGRAM_ID = new PublicKey("H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77");
// const INCO_PROGRAM_ID = new PublicKey("5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj");
// const HELIUS_RPC = "https://devnet.helius-rpc.com/?api-key=921ba1f0-fa17-4803-8417-e8c04743d961";

// export default function BetBox({ marketId }: { marketId: string }) {
//   const wallet = useWallet();
//   const anchorWallet = useAnchorWallet();

//   const [amount, setAmount] = useState("");
//   const [side, setSide] = useState<"YES" | "NO">("YES");
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);

//   const placeBet = async () => {
//     if (!anchorWallet || !wallet.publicKey) {
//       alert("Please connect wallet");
//       return;
//     }

//     const sol = Number(amount);
//     if (!sol || sol <= 0) {
//       alert("Enter valid amount");
//       return;
//     }

//     const lamports = Math.floor(sol * 1e9);

//     setLoading(true);
//     setSuccess(false);

//     try {
//       const connection = new Connection(HELIUS_RPC, "confirmed");

//       const marketIdNum = Number(marketId);
//       const marketIdBuf = Buffer.alloc(4);
//       marketIdBuf.writeUInt32LE(marketIdNum, 0);

//       const [marketPda] = PublicKey.findProgramAddressSync(
//         [Buffer.from("market"), marketIdBuf],
//         PROGRAM_ID
//       );

//       const marketInfo = await connection.getAccountInfo(marketPda);
//       if (!marketInfo) {
//         alert(`Market ${marketId} does not exist!`);
//         setLoading(false);
//         return;
//       }

//       const [betPda] = PublicKey.findProgramAddressSync(
//         [Buffer.from("bet"), marketPda.toBuffer(), anchorWallet.publicKey.toBuffer()],
//         PROGRAM_ID
//       );

//       const [vaultPda] = PublicKey.findProgramAddressSync(
//         [Buffer.from("vault"), marketIdBuf],
//         PROGRAM_ID
//       );

//       const userWSOL = getAssociatedTokenAddressSync(
//         NATIVE_MINT,
//         anchorWallet.publicKey
//       );

//       const tx = new Transaction();

//       const ataInfo = await connection.getAccountInfo(userWSOL);
//       if (!ataInfo) {
//         tx.add(
//           createAssociatedTokenAccountInstruction(
//             anchorWallet.publicKey,
//             userWSOL,
//             anchorWallet.publicKey,
//             NATIVE_MINT
//           )
//         );
//       }

//       tx.add(
//         SystemProgram.transfer({
//           fromPubkey: anchorWallet.publicKey,
//           toPubkey: userWSOL,
//           lamports: lamports,
//         }),
//         createSyncNativeInstruction(userWSOL)
//       );

//       console.log("🔒 Encrypting YES/NO with Inco...");
//       const sideValue = side === "YES" ? 0 : 1;
      
//       const { encryptedSide } = await encryptBetData(
//         0,
//         sideValue,
//         anchorWallet.publicKey
//       );

//       const encryptedBetData = encryptedSide;

//       let offset = 0;
//       const maxSize = 8 + 4 + 8 + 1 + 4 + 256;
//       const instructionData = Buffer.alloc(maxSize);

//       const discriminator = Buffer.from([0x7c, 0xa8, 0xc0, 0x46, 0xf6, 0x23, 0xd3, 0x64]);
//       discriminator.copy(instructionData, offset);
//       offset += 8;

//       instructionData.writeUInt32LE(marketIdNum, offset);
//       offset += 4;

//       instructionData.writeBigUInt64LE(BigInt(lamports), offset);
//       offset += 8;

//       instructionData.writeUInt8(0, offset);
//       offset += 1;

//       instructionData.writeUInt32LE(encryptedBetData.length, offset);
//       offset += 4;
//       encryptedBetData.copy(instructionData, offset);
//       offset += encryptedBetData.length;

//       const finalData = instructionData.slice(0, offset);

//       const betIx = new TransactionInstruction({
//         keys: [
//           { pubkey: marketPda, isSigner: false, isWritable: true },
//           { pubkey: anchorWallet.publicKey, isSigner: true, isWritable: true },
//           { pubkey: userWSOL, isSigner: false, isWritable: true },
//           { pubkey: vaultPda, isSigner: false, isWritable: true },
//           { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
//           { pubkey: INCO_PROGRAM_ID, isSigner: false, isWritable: false },
//           { pubkey: betPda, isSigner: false, isWritable: true },
//           { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
//         ],
//         programId: PROGRAM_ID,
//         data: finalData,
//       });

//       tx.add(betIx);

//       const provider = new AnchorProvider(connection, anchorWallet, { commitment: "confirmed" });
//       const sig = await provider.sendAndConfirm(tx);

//       console.log("✅ Bet placed:", sig);
//       alert(`✅ Bet placed!\n\nAmount: ${amount} SOL (public)\nSide: Hidden (Inco encrypted)\n\nTX: ${sig}`);
//       setSuccess(true);
//       setAmount("");
//     } catch (e: any) {
//       console.error("❌ Error:", e);

//       let msg = "Transaction failed";
//       if (e.message) {
//         if (e.message.includes("insufficient")) {
//           msg = `Insufficient funds. Need ${amount} SOL in wallet`;
//         } else if (e.message.includes("0x0")) {
//           msg = "Market already settled";
//         } else if (e.message.includes("0x2")) {
//           msg = "Invalid amount";
//         } else if (e.message.includes("0x3")) {
//           msg = "Already placed bet on this market";
//         } else {
//           msg = e.message.substring(0, 100);
//         }
//       }

//       alert(`❌ ${msg}\n\nCheck console for details`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{
//       border: "2px solid #000",
//       padding: 24,
//       borderRadius: 12,
//       background: "#fff",
//       maxWidth: 500,
//       margin: "20px auto"
//     }}>
//       <h3 style={{ marginTop: 0 }}>🎲 Place Bet</h3>

//       <div style={{ marginBottom: 16 }}>
//         <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
//           Choose Side (Private with Inco):
//         </label>
//         <div style={{ display: "flex", gap: 12 }}>
//           <button
//             onClick={() => setSide("YES")}
//             style={{
//               flex: 1,
//               padding: 16,
//               background: side === "YES" ? "#22c55e" : "#fff",
//               color: side === "YES" ? "#fff" : "#000",
//               border: "2px solid #000",
//               borderRadius: 8,
//               cursor: "pointer",
//               fontSize: 16,
//               fontWeight: 600
//             }}
//           >
//             YES
//           </button>
//           <button
//             onClick={() => setSide("NO")}
//             style={{
//               flex: 1,
//               padding: 16,
//               background: side === "NO" ? "#ef4444" : "#fff",
//               color: side === "NO" ? "#fff" : "#000",
//               border: "2px solid #000",
//               borderRadius: 8,
//               cursor: "pointer",
//               fontSize: 16,
//               fontWeight: 600
//             }}
//           >
//             NO
//           </button>
//         </div>
//       </div>

//       <div style={{ marginBottom: 16 }}>
//         <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
//           Amount (SOL) - Public:
//         </label>
//         <input
//           type="number"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//           placeholder="0.1"
//           step="0.01"
//           min="0.01"
//           style={{
//             width: "100%",
//             padding: 12,
//             fontSize: 16,
//             border: "2px solid #000",
//             borderRadius: 8,
//             boxSizing: "border-box"
//           }}
//         />
//         <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
//           Amount shown on-chain, YES/NO choice is encrypted
//         </div>
//       </div>

//       <div style={{
//         marginBottom: 16,
//         padding: 12,
//         background: "#f0f9ff",
//         borderRadius: 8,
//         border: "1px solid #0ea5e9"
//       }}>
//         <div style={{ fontWeight: 600, marginBottom: 8 }}>🔒 Privacy Features</div>
//         <div style={{ fontSize: 12, color: "#0369a1" }}>
//           ✅ Amount: Public (visible on-chain)<br/>
//           🔐 YES/NO: Private (Inco FHE encryption)<br/>
//           🔑 Only revealed when claiming rewards
//         </div>
//       </div>

//       <button
//         disabled={loading || !wallet.publicKey}
//         onClick={placeBet}
//         style={{
//           width: "100%",
//           padding: 16,
//           background: loading ? "#999" : "#000",
//           color: "#fff",
//           border: "none",
//           borderRadius: 8,
//           cursor: loading ? "not-allowed" : "pointer",
//           fontSize: 18,
//           fontWeight: 600
//         }}
//       >
//         {loading ? "Placing bet..." : "Place Bet"}
//       </button>

//       {success && (
//         <div style={{
//           marginTop: 16,
//           padding: 12,
//           background: "#dcfce7",
//           color: "#16a34a",
//           borderRadius: 8,
//           textAlign: "center",
//           fontWeight: 600
//         }}>
//           ✅ Bet placed successfully!
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  TOKEN_PROGRAM_ID,
  NATIVE_MINT,
} from "@solana/spl-token";
import { Buffer } from "buffer";
import { encryptBetData } from "../lib/inco";

const PROGRAM_ID = new PublicKey("H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77");
const INCO_PROGRAM_ID = new PublicKey("5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj");
const HELIUS_RPC = "https://devnet.helius-rpc.com/?api-key=921ba1f0-fa17-4803-8417-e8c04743d961";

// Dummy chart data for visualization
const generateChartData = () => {
  const points = 50;
  const data = [];
  let yesValue = 50 + Math.random() * 10;
  
  for (let i = 0; i < points; i++) {
    yesValue += (Math.random() - 0.5) * 8;
    yesValue = Math.max(20, Math.min(80, yesValue));
    
    data.push({
      x: i,
      yes: yesValue,
      no: 100 - yesValue,
    });
  }
  
  return data;
};

export default function BetBox({ marketId }: { marketId: string }) {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();

  const [amount, setAmount] = useState("");
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [chartData] = useState(generateChartData());

  const placeBet = async () => {
    if (!anchorWallet || !wallet.publicKey) {
      alert("Please connect wallet");
      return;
    }

    const sol = Number(amount);
    if (!sol || sol <= 0) {
      alert("Enter valid amount");
      return;
    }

    const lamports = Math.floor(sol * 1e9);

    setLoading(true);
    setSuccess(false);

    try {
      const connection = new Connection(HELIUS_RPC, "confirmed");

      const marketIdNum = Number(marketId);
      const marketIdBuf = Buffer.alloc(4);
      marketIdBuf.writeUInt32LE(marketIdNum, 0);

      const [marketPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("market"), marketIdBuf],
        PROGRAM_ID
      );

      const marketInfo = await connection.getAccountInfo(marketPda);
      if (!marketInfo) {
        alert(`Market ${marketId} does not exist!`);
        setLoading(false);
        return;
      }

      const [betPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("bet"), marketPda.toBuffer(), anchorWallet.publicKey.toBuffer()],
        PROGRAM_ID
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), marketIdBuf],
        PROGRAM_ID
      );

      const userWSOL = getAssociatedTokenAddressSync(
        NATIVE_MINT,
        anchorWallet.publicKey
      );

      const tx = new Transaction();

      const ataInfo = await connection.getAccountInfo(userWSOL);
      if (!ataInfo) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            anchorWallet.publicKey,
            userWSOL,
            anchorWallet.publicKey,
            NATIVE_MINT
          )
        );
      }

      tx.add(
        SystemProgram.transfer({
          fromPubkey: anchorWallet.publicKey,
          toPubkey: userWSOL,
          lamports: lamports,
        }),
        createSyncNativeInstruction(userWSOL)
      );

      console.log("🔒 Encrypting YES/NO with Inco...");
      const sideValue = side === "YES" ? 0 : 1;
      
      const { encryptedSide } = await encryptBetData(
        0,
        sideValue,
        anchorWallet.publicKey
      );

      const encryptedBetData = encryptedSide;

      let offset = 0;
      const maxSize = 8 + 4 + 8 + 1 + 4 + 256;
      const instructionData = Buffer.alloc(maxSize);

      const discriminator = Buffer.from([0x7c, 0xa8, 0xc0, 0x46, 0xf6, 0x23, 0xd3, 0x64]);
      discriminator.copy(instructionData, offset);
      offset += 8;

      instructionData.writeUInt32LE(marketIdNum, offset);
      offset += 4;

      instructionData.writeBigUInt64LE(BigInt(lamports), offset);
      offset += 8;

      instructionData.writeUInt8(0, offset);
      offset += 1;

      instructionData.writeUInt32LE(encryptedBetData.length, offset);
      offset += 4;
      encryptedBetData.copy(instructionData, offset);
      offset += encryptedBetData.length;

      const finalData = instructionData.slice(0, offset);

      const betIx = new TransactionInstruction({
        keys: [
          { pubkey: marketPda, isSigner: false, isWritable: true },
          { pubkey: anchorWallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: userWSOL, isSigner: false, isWritable: true },
          { pubkey: vaultPda, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: INCO_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: betPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: finalData,
      });

      tx.add(betIx);

      const provider = new AnchorProvider(connection, anchorWallet, { commitment: "confirmed" });
      const sig = await provider.sendAndConfirm(tx);

      console.log("✅ Bet placed:", sig);
      alert(`✅ Bet placed!\n\nAmount: ${amount} SOL (public)\nSide: Hidden (Inco encrypted)\n\nTX: ${sig}`);
      setSuccess(true);
      setAmount("");
    } catch (e: any) {
      console.error("❌ Error:", e);

      let msg = "Transaction failed";
      if (e.message) {
        if (e.message.includes("insufficient")) {
          msg = `Insufficient funds. Need ${amount} SOL in wallet`;
        } else if (e.message.includes("0x0")) {
          msg = "Market already settled";
        } else if (e.message.includes("0x2")) {
          msg = "Invalid amount";
        } else if (e.message.includes("0x3")) {
          msg = "Already placed bet on this market";
        } else {
          msg = e.message.substring(0, 100);
        }
      }

      alert(`❌ ${msg}\n\nCheck console for details`);
    } finally {
      setLoading(false);
    }
  };

  const currentYes = chartData[chartData.length - 1]?.yes || 50;
  const currentNo = 100 - currentYes;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      gap: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      {/* LEFT SIDE - CHART */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: '16px',
        padding: '24px',
      }}>
        {/* Chart Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              Market Probability
            </h3>
            <div style={{
              display: 'flex',
              gap: '8px',
              fontSize: '12px',
            }}>
              {['1H', '6H', '1D', '1W', '1M', 'ALL'].map((period) => (
                <button
                  key={period}
                  style={{
                    padding: '4px 12px',
                    background: period === 'ALL' ? 'var(--bg-hover)' : 'transparent',
                    color: period === 'ALL' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (period !== 'ALL') {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Current Probabilities */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '20px',
          }}>
            <div style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}>
              <div style={{
                fontSize: '12px',
                color: 'var(--yes-color)',
                fontWeight: '600',
                marginBottom: '4px',
              }}>
                YES
              </div>
              <div style={{
                fontSize: '28px',
                color: 'var(--yes-color)',
                fontWeight: '700',
              }}>
                {currentYes.toFixed(0)}%
              </div>
            </div>
            <div style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}>
              <div style={{
                fontSize: '12px',
                color: 'var(--no-color)',
                fontWeight: '600',
                marginBottom: '4px',
              }}>
                NO
              </div>
              <div style={{
                fontSize: '28px',
                color: 'var(--no-color)',
                fontWeight: '700',
              }}>
                {currentNo.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Chart SVG */}
        <div style={{
          width: '100%',
          height: '300px',
          position: 'relative',
        }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 500 300"
            style={{ overflow: 'visible' }}
          >
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <g key={y}>
                <line
                  x1="0"
                  y1={(100 - y) * 3}
                  x2="500"
                  y2={(100 - y) * 3}
                  stroke="var(--border-primary)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.3"
                />
                <text
                  x="-10"
                  y={(100 - y) * 3 + 4}
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="end"
                >
                  {y}%
                </text>
              </g>
            ))}

            {/* YES Area */}
            <defs>
              <linearGradient id="yesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--yes-color)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--yes-color)" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="noGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="var(--no-color)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--no-color)" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* YES area path */}
            <path
              d={`M 0 300 ${chartData.map((d, i) => `L ${(i / (chartData.length - 1)) * 500} ${(100 - d.yes) * 3}`).join(' ')} L 500 300 Z`}
              fill="url(#yesGradient)"
            />

            {/* NO area path */}
            <path
              d={`M 0 0 ${chartData.map((d, i) => `L ${(i / (chartData.length - 1)) * 500} ${(100 - d.yes) * 3}`).join(' ')} L 500 0 Z`}
              fill="url(#noGradient)"
            />

            {/* YES line */}
            <path
              d={`M ${chartData.map((d, i) => `${(i / (chartData.length - 1)) * 500} ${(100 - d.yes) * 3}`).join(' L ')}`}
              stroke="var(--yes-color)"
              strokeWidth="2.5"
              fill="none"
            />
          </svg>
        </div>

        {/* Stats */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'var(--bg-tertiary)',
          borderRadius: '8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}>
          <div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '4px',
            }}>
              24h Volume
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: 'var(--text-primary)',
            }}>
              $236,348,768
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '4px',
            }}>
              24h Change
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: 'var(--yes-color)',
            }}>
              +2%
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - BET INTERFACE */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}>
              🎲
            </div>
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: 0,
              }}>
                Place Your Bet
              </h3>
              <p style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                margin: 0,
              }}>
                Market #{marketId}
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            gap: '4px',
            padding: '4px',
            background: 'var(--bg-tertiary)',
            borderRadius: '8px',
          }}>
            <button
              style={{
                flex: 1,
                padding: '8px',
                background: 'var(--brand-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Buy
            </button>
            <button
              style={{
                flex: 1,
                padding: '8px',
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              Sell
            </button>
          </div>
        </div>

        {/* Outcome Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}>
            Outcome
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setSide("YES")}
              style={{
                flex: 1,
                padding: '16px',
                background: side === "YES" 
                  ? 'linear-gradient(135deg, var(--yes-color) 0%, var(--yes-hover) 100%)'
                  : 'var(--bg-tertiary)',
                color: side === "YES" ? 'white' : 'var(--text-secondary)',
                border: side === "YES" ? 'none' : '1px solid var(--border-primary)',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '700',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => {
                if (side !== "YES") {
                  e.currentTarget.style.borderColor = 'var(--yes-color)';
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (side !== "YES") {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }
              }}
            >
              <span>YES</span>
              <span style={{
                fontSize: '18px',
                fontWeight: '700',
                color: side === "YES" ? 'white' : 'var(--yes-color)',
              }}>
                {currentYes.toFixed(0)}¢
              </span>
            </button>
            <button
              onClick={() => setSide("NO")}
              style={{
                flex: 1,
                padding: '16px',
                background: side === "NO" 
                  ? 'linear-gradient(135deg, var(--no-color) 0%, var(--no-hover) 100%)'
                  : 'var(--bg-tertiary)',
                color: side === "NO" ? 'white' : 'var(--text-secondary)',
                border: side === "NO" ? 'none' : '1px solid var(--border-primary)',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '700',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => {
                if (side !== "NO") {
                  e.currentTarget.style.borderColor = 'var(--no-color)';
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (side !== "NO") {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }
              }}
            >
              <span>NO</span>
              <span style={{
                fontSize: '18px',
                fontWeight: '700',
                color: side === "NO" ? 'white' : 'var(--no-color)',
              }}>
                {currentNo.toFixed(0)}¢
              </span>
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}>
            Amount
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              style={{
                width: '100%',
                padding: '14px 16px',
                paddingRight: '60px',
                fontSize: '32px',
                fontWeight: '700',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '10px',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <div style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--text-muted)',
            }}>
              SOL
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '12px',
          }}>
            {['0.1', '0.5', '1', '5'].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.borderColor = 'var(--brand-primary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {val} SOL
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          padding: '16px',
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.1)',
          borderRadius: '10px',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <span style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--brand-primary)',
            }}>
              Privacy Protected
            </span>
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
          }}>
            Your bet amount is public, but your YES/NO choice is encrypted using Inco FHE technology and only revealed when claiming rewards.
          </div>
        </div>

        {/* Place Bet Button */}
        <button
          disabled={loading || !wallet.publicKey}
          onClick={placeBet}
          style={{
            width: '100%',
            padding: '16px',
            background: loading || !wallet.publicKey
              ? 'var(--bg-hover)'
              : 'linear-gradient(135deg, var(--brand-primary) 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: loading || !wallet.publicKey ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '700',
            transition: 'all 0.2s ease',
            opacity: loading || !wallet.publicKey ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading && wallet.publicKey) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              Placing Bet...
            </div>
          ) : !wallet.publicKey ? (
            'Connect Wallet to Trade'
          ) : (
            `Place Bet`
          )}
        </button>

        {/* Success Message */}
        {success && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--success)',
            }}>
              Bet placed successfully!
            </span>
          </div>
        )}

        {/* Terms */}
        <p style={{
          marginTop: 'auto',
          paddingTop: '20px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          lineHeight: '1.5',
        }}>
          By trading, you agree to the Terms of Service
        </p>
      </div>
    </div>
  );
}