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
//         <div style={{ fontWeight: 600, marginBottom: 8 }}>🔒 Privacy</div>
//         <div style={{ fontSize: 12, color: "#0369a1" }}>
//           ✅ Amount: Public<br/>
//           🔐 YES/NO: Private (Inco FHE)
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

export default function BetBox({ marketId }: { marketId: string }) {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();

  const [amount, setAmount] = useState("");
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  return (
    <div style={{
      border: "2px solid #000",
      padding: 24,
      borderRadius: 12,
      background: "#fff",
      maxWidth: 500,
      margin: "20px auto"
    }}>
      <h3 style={{ marginTop: 0 }}>🎲 Place Bet</h3>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Choose Side (Private with Inco):
        </label>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setSide("YES")}
            style={{
              flex: 1,
              padding: 16,
              background: side === "YES" ? "#22c55e" : "#fff",
              color: side === "YES" ? "#fff" : "#000",
              border: "2px solid #000",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 600
            }}
          >
            YES
          </button>
          <button
            onClick={() => setSide("NO")}
            style={{
              flex: 1,
              padding: 16,
              background: side === "NO" ? "#ef4444" : "#fff",
              color: side === "NO" ? "#fff" : "#000",
              border: "2px solid #000",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 600
            }}
          >
            NO
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Amount (SOL) - Public:
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.1"
          step="0.01"
          min="0.01"
          style={{
            width: "100%",
            padding: 12,
            fontSize: 16,
            border: "2px solid #000",
            borderRadius: 8,
            boxSizing: "border-box"
          }}
        />
        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
          Amount shown on-chain, YES/NO choice is encrypted
        </div>
      </div>

      <div style={{
        marginBottom: 16,
        padding: 12,
        background: "#f0f9ff",
        borderRadius: 8,
        border: "1px solid #0ea5e9"
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>🔒 Privacy Features</div>
        <div style={{ fontSize: 12, color: "#0369a1" }}>
          ✅ Amount: Public (visible on-chain)<br/>
          🔐 YES/NO: Private (Inco FHE encryption)<br/>
          🔑 Only revealed when claiming rewards
        </div>
      </div>

      <button
        disabled={loading || !wallet.publicKey}
        onClick={placeBet}
        style={{
          width: "100%",
          padding: 16,
          background: loading ? "#999" : "#000",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: 18,
          fontWeight: 600
        }}
      >
        {loading ? "Placing bet..." : "Place Bet"}
      </button>

      {success && (
        <div style={{
          marginTop: 16,
          padding: 12,
          background: "#dcfce7",
          color: "#16a34a",
          borderRadius: 8,
          textAlign: "center",
          fontWeight: 600
        }}>
          ✅ Bet placed successfully!
        </div>
      )}
    </div>
  );
}