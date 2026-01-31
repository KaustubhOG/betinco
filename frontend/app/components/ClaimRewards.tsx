// "use client";

// import { useState } from "react";
// import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
// import { Connection, PublicKey, Transaction, SYSVAR_INSTRUCTIONS_PUBKEY } from "@solana/web3.js";
// import { AnchorProvider, Program } from "@coral-xyz/anchor";
// import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, NATIVE_MINT } from "@solana/spl-token";
// import IDL from "@/app/idl/betinco.json";

// const PROGRAM_ID = new PublicKey("H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77");
// const INCO_PROGRAM_ID = new PublicKey("5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj");
// const HELIUS_RPC = "https://devnet.helius-rpc.com/?api-key=921ba1f0-fa17-4803-8417-e8c04743d961";

// // Toggle simulation on/off. When true, code will simulate a successful claim
// // and skip Inco TEE decryption and sending a real transaction.
// const SIMULATE_CLAIM = true;

// export default function ClaimRewards({ marketId }: { marketId: string }) {
//   const wallet = useWallet();
//   const anchorWallet = useAnchorWallet();
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [decryptedSide, setDecryptedSide] = useState<string | null>(null);

//   const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

//   const claimRewards = async () => {
//     if (!anchorWallet || !wallet.signMessage) {
//       alert("Please connect your wallet");
//       return;
//     }

//     setLoading(true);
//     setSuccess(false);
//     setDecryptedSide(null);

//     try {
//       if (SIMULATE_CLAIM) {
//         // Simulation path: pretend decryption + claim succeeded.
//         // This is useful while the Inco TEE integration is unstable.
//         await sleep(900); // small delay to emulate async work

//         // Simulated decrypted side: you can change this to "NO" if you prefer.
//         const simulatedSide = "YES";
//         setDecryptedSide(simulatedSide);
//         setSuccess(true);

//         // Inform the user this is a simulation and why
//         // (no emojis per request).
//         alert(
//           `Claim simulated successfully.\n\nDecrypted bet side: ${simulatedSide}.\n\n` +
//           `Note: Real Inco TEE decryption is currently not functioning in this environment. ` +
//           `This action was simulated. The TEE decryption and on-chain claim flow will be fixed in v2.`
//         );

//         setLoading(false);
//         return;
//       }

//       // === Real flow (kept here for reference; not executed when SIMULATE_CLAIM = true) ===
//       const connection = new Connection(HELIUS_RPC, "confirmed");
//       const provider = new AnchorProvider(connection, anchorWallet, {
//         commitment: "confirmed",
//       });

//       const program = new Program(IDL as any, provider);
//       const marketIdNum = parseInt(marketId);

//       const marketIdBuffer = Buffer.alloc(4);
//       marketIdBuffer.writeUInt32LE(marketIdNum, 0);

//       const [marketPda] = PublicKey.findProgramAddressSync(
//         [Buffer.from("market"), marketIdBuffer],
//         program.programId
//       );

//       const [vaultPda] = PublicKey.findProgramAddressSync(
//         [Buffer.from("vault"), marketIdBuffer],
//         program.programId
//       );

//       const [betPda] = PublicKey.findProgramAddressSync(
//         [Buffer.from("bet"), marketPda.toBuffer(), anchorWallet.publicKey.toBuffer()],
//         program.programId
//       );

//       const betAccount = await connection.getAccountInfo(betPda);
//       if (!betAccount) {
//         throw new Error("You haven't placed a bet on this market");
//       }

//       const betData = betAccount.data;
//       let offset = 8; // Skip discriminator
//       offset += 16; // Skip encrypted_amount (Euint128 = 16 bytes)

//       const encryptedSideBytes = betData.slice(offset, offset + 16);
//       const handleLow = encryptedSideBytes.readBigUInt64LE(0);
//       const encryptedSideHandle = handleLow.toString();

//       // Dynamic import of Inco SDK (real flow)
//       const { decrypt } = await import("@inco/solana-sdk/attested-decrypt");
//       const { handleToBuffer, plaintextToBuffer } = await import("@inco/solana-sdk/utils");

//       const decryptResult = await decrypt([encryptedSideHandle], {
//         address: anchorWallet.publicKey,
//         signMessage: wallet.signMessage,
//       });

//       const sideText = decryptResult.plaintexts[0] === "0" ? "YES" : "NO";
//       setDecryptedSide(sideText);

//       const handleBuffers = decryptResult.handles.map(h => handleToBuffer(h));
//       const plaintextBuffers = decryptResult.plaintexts.map(p => plaintextToBuffer(p));

//       const userTokenAccount = getAssociatedTokenAddressSync(NATIVE_MINT, anchorWallet.publicKey);

//       const claimInstruction = await program.methods
//         .claimPrivate(
//           marketIdNum,
//           decryptResult.handles.length,
//           handleBuffers,
//           plaintextBuffers
//         )
//         .accounts({
//           user: anchorWallet.publicKey,
//           market: marketPda,
//           userCollateral: userTokenAccount,
//           collateralVault: vaultPda,
//           betAccount: betPda,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           incoLightningProgram: INCO_PROGRAM_ID,
//           instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
//         })
//         .instruction();

//       const tx = new Transaction();

//       if (decryptResult.ed25519Instructions && decryptResult.ed25519Instructions.length > 0) {
//         decryptResult.ed25519Instructions.forEach((ix) => tx.add(ix));
//       } else {
//         throw new Error("No Ed25519 instruction found");
//       }

//       tx.add(claimInstruction);

//       const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
//       tx.recentBlockhash = blockhash;
//       tx.feePayer = anchorWallet.publicKey;

//       const signedTx = await wallet.signTransaction!(tx);
//       const signature = await connection.sendRawTransaction(signedTx.serialize(), {
//         skipPreflight: false,
//         preflightCommitment: "confirmed",
//       });

//       const confirmation = await connection.confirmTransaction({
//         signature,
//         blockhash,
//         lastValidBlockHeight,
//       }, "confirmed");

//       if (confirmation.value.err) {
//         throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
//       }

//       setSuccess(true);
//       alert(`Rewards claimed. TX: ${signature}`);
//     } catch (error: any) {
//       console.error("Error:", error);
//       let errorMsg = "Failed to claim rewards";

//       if (error.message?.includes("haven't placed a bet")) {
//         errorMsg = "You haven't placed a bet on this market";
//       } else if (error.message?.includes("AlreadyClaimed")) {
//         errorMsg = "You've already claimed rewards";
//       } else if (error.message?.includes("NotEligible")) {
//         errorMsg = "You didn't bet on the winning side";
//       } else if (error.message?.includes("MarketNotSettled")) {
//         errorMsg = "Market hasn't been settled yet";
//       } else if (error.message?.includes("Address is not allowed")) {
//         errorMsg = "Permission error: The bet was placed with a different wallet or before the permission fix. Please re-place your bet.";
//       } else if (error.message) {
//         errorMsg = error.message;
//       }

//       alert(`${errorMsg}\n\nCheck console for full details`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ border: "2px solid #000", borderRadius: "12px", padding: "24px", maxWidth: "550px", margin: "20px auto", background: "#fff" }}>
//       <h3 style={{ marginTop: 0 }}>Claim Rewards</h3>
//       <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>Market ID: {marketId}</p>
//       {decryptedSide && (
//         <div style={{ marginBottom: "20px", padding: "12px", background: "#dcfce7", borderRadius: "8px", border: "1px solid #22c55e" }}>
//           <strong>Your Bet:</strong> {decryptedSide}
//         </div>
//       )}
//       <button
//         onClick={claimRewards}
//         disabled={loading || !wallet.publicKey}
//         style={{
//           width: "100%",
//           padding: "16px",
//           background: loading ? "#9ca3af" : "#059669",
//           color: "#fff",
//           border: "none",
//           borderRadius: "8px",
//           cursor: loading ? "not-allowed" : "pointer",
//           fontSize: "18px",
//           fontWeight: 600
//         }}
//       >
//         {loading ? "Claiming..." : (SIMULATE_CLAIM ? "Claim Rewards (Simulate)" : "Claim Rewards")}
//       </button>
//       {success && (
//         <div style={{ marginTop: "16px", padding: "12px", background: "#dcfce7", color: "#16a34a", borderRadius: "8px", textAlign: "center", fontWeight: 600 }}>
//           Rewards claimed successfully (simulated).
//         </div>
//       )}
//       {!SIMULATE_CLAIM && (
//         <div style={{ marginTop: "12px", fontSize: "12px", color: "#444" }}>
//           Note: This will attempt a real Inco TEE decryption and on-chain claim. Ensure Inco SDK and program are available.
//         </div>
//       )}
//       {SIMULATE_CLAIM && (
//         <div style={{ marginTop: "12px", fontSize: "12px", color: "#444" }}>
//           Note: Inco TEE decryption is currently unstable in this environment. This claim was simulated. Real TEE decryption and on-chain claim will be implemented in v2.
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction, SYSVAR_INSTRUCTIONS_PUBKEY } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, NATIVE_MINT } from "@solana/spl-token";
import IDL from "@/app/idl/betinco.json";

const PROGRAM_ID = new PublicKey("H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77");
const INCO_PROGRAM_ID = new PublicKey("5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj");
const HELIUS_RPC = "https://devnet.helius-rpc.com/?api-key=921ba1f0-fa17-4803-8417-e8c04743d961";

const SIMULATE_CLAIM = true;

export default function ClaimRewards({ marketId }: { marketId: string }) {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [decryptedSide, setDecryptedSide] = useState<string | null>(null);

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const claimRewards = async () => {
    if (!anchorWallet || !wallet.signMessage) {
      alert("Please connect your wallet");
      return;
    }

    setLoading(true);
    setSuccess(false);
    setDecryptedSide(null);

    try {
      if (SIMULATE_CLAIM) {
        await sleep(900);
        const simulatedSide = "YES";
        setDecryptedSide(simulatedSide);
        setSuccess(true);

        alert(
          `Claim simulated successfully.\n\nDecrypted bet side: ${simulatedSide}.\n\n` +
          `Note: Real Inco TEE decryption is currently not functioning in this environment. ` +
          `This action was simulated. The TEE decryption and on-chain claim flow will be fixed in v2.`
        );

        setLoading(false);
        return;
      }

      // Real flow (kept for reference)
      const connection = new Connection(HELIUS_RPC, "confirmed");
      const provider = new AnchorProvider(connection, anchorWallet, {
        commitment: "confirmed",
      });

      const program = new Program(IDL as any, provider);
      const marketIdNum = parseInt(marketId);

      const marketIdBuffer = Buffer.alloc(4);
      marketIdBuffer.writeUInt32LE(marketIdNum, 0);

      const [marketPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("market"), marketIdBuffer],
        program.programId
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), marketIdBuffer],
        program.programId
      );

      const [betPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("bet"), marketPda.toBuffer(), anchorWallet.publicKey.toBuffer()],
        program.programId
      );

      const betAccount = await connection.getAccountInfo(betPda);
      if (!betAccount) {
        throw new Error("You haven't placed a bet on this market");
      }

      const betData = betAccount.data;
      let offset = 8;
      offset += 16;

      const encryptedSideBytes = betData.slice(offset, offset + 16);
      const handleLow = encryptedSideBytes.readBigUInt64LE(0);
      const encryptedSideHandle = handleLow.toString();

      const { decrypt } = await import("@inco/solana-sdk/attested-decrypt");
      const { handleToBuffer, plaintextToBuffer } = await import("@inco/solana-sdk/utils");

      const decryptResult = await decrypt([encryptedSideHandle], {
        address: anchorWallet.publicKey,
        signMessage: wallet.signMessage,
      });

      const sideText = decryptResult.plaintexts[0] === "0" ? "YES" : "NO";
      setDecryptedSide(sideText);

      const handleBuffers = decryptResult.handles.map(h => handleToBuffer(h));
      const plaintextBuffers = decryptResult.plaintexts.map(p => plaintextToBuffer(p));

      const userTokenAccount = getAssociatedTokenAddressSync(NATIVE_MINT, anchorWallet.publicKey);

      const claimInstruction = await program.methods
        .claimPrivate(
          marketIdNum,
          decryptResult.handles.length,
          handleBuffers,
          plaintextBuffers
        )
        .accounts({
          user: anchorWallet.publicKey,
          market: marketPda,
          userCollateral: userTokenAccount,
          collateralVault: vaultPda,
          betAccount: betPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          incoLightningProgram: INCO_PROGRAM_ID,
          instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
        })
        .instruction();

      const tx = new Transaction();

      if (decryptResult.ed25519Instructions && decryptResult.ed25519Instructions.length > 0) {
        decryptResult.ed25519Instructions.forEach((ix) => tx.add(ix));
      } else {
        throw new Error("No Ed25519 instruction found");
      }

      tx.add(claimInstruction);

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = blockhash;
      tx.feePayer = anchorWallet.publicKey;

      const signedTx = await wallet.signTransaction!(tx);
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, "confirmed");

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      setSuccess(true);
      alert(`Rewards claimed. TX: ${signature}`);
    } catch (error: any) {
      console.error("Error:", error);
      let errorMsg = "Failed to claim rewards";

      if (error.message?.includes("haven't placed a bet")) {
        errorMsg = "You haven't placed a bet on this market";
      } else if (error.message?.includes("AlreadyClaimed")) {
        errorMsg = "You've already claimed rewards";
      } else if (error.message?.includes("NotEligible")) {
        errorMsg = "You didn't bet on the winning side";
      } else if (error.message?.includes("MarketNotSettled")) {
        errorMsg = "Market hasn't been settled yet";
      } else if (error.message?.includes("Address is not allowed")) {
        errorMsg = "Permission error: The bet was placed with a different wallet or before the permission fix. Please re-place your bet.";
      } else if (error.message) {
        errorMsg = error.message;
      }

      alert(`${errorMsg}\n\nCheck console for full details`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "var(--bg-secondary)",
      border: "1px solid var(--border-primary)",
      borderRadius: "16px",
      padding: "32px",
    }}>
      {/* Header */}
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
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
        }}>
          💰
        </div>
        <div>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "var(--text-primary)",
            marginBottom: "4px",
          }}>
            Claim Your Rewards
          </h3>
          <p style={{
            fontSize: "13px",
            color: "var(--text-muted)",
          }}>
            Market ID: {marketId}
          </p>
        </div>
      </div>

      {/* Decrypted Side Display */}
      {decryptedSide && (
        <div style={{
          marginBottom: "24px",
          padding: "16px",
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          borderRadius: "10px",
          animation: "slideUp 0.3s ease-out",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}>
            <div style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--success)",
            }} />
            <span style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--success)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Your Bet Decrypted
            </span>
          </div>
          <div style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "var(--success)",
          }}>
            {decryptedSide}
          </div>
        </div>
      )}

      {/* Claim Button */}
      <button
        onClick={claimRewards}
        disabled={loading || !wallet.publicKey}
        style={{
          width: "100%",
          padding: "14px",
          background: loading || !wallet.publicKey ? "var(--bg-hover)" : "var(--success)",
          color: "white",
          border: "none",
          borderRadius: "10px",
          fontSize: "15px",
          fontWeight: "600",
          cursor: loading || !wallet.publicKey ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          opacity: loading || !wallet.publicKey ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!loading && wallet.publicKey) {
            e.currentTarget.style.background = "var(--yes-hover)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && wallet.publicKey) {
            e.currentTarget.style.background = "var(--success)";
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
      >
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <div style={{
              width: "16px",
              height: "16px",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              borderTop: "2px solid white",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            Claiming...
          </span>
        ) : (
          SIMULATE_CLAIM ? "Claim Rewards (Simulate)" : "Claim Rewards"
        )}
      </button>

      {/* Success Message */}
      {success && (
        <div style={{
          marginTop: "16px",
          padding: "16px",
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          animation: "slideUp 0.3s ease-out",
        }}>
          <div style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: "var(--success)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "14px",
            fontWeight: "700",
          }}>
            ✓
          </div>
          <div>
            <div style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "var(--success)",
              marginBottom: "2px",
            }}>
              Rewards claimed successfully!
            </div>
            <div style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
            }}>
              {SIMULATE_CLAIM ? "This was a simulated claim" : "Check your wallet for rewards"}
            </div>
          </div>
        </div>
      )}

      {/* Info Notice */}
      <div style={{
        marginTop: "16px",
        padding: "12px",
        background: "rgba(99, 102, 241, 0.05)",
        border: "1px solid rgba(99, 102, 241, 0.1)",
        borderRadius: "8px",
        fontSize: "12px",
        color: "var(--text-muted)",
        lineHeight: "1.6",
      }}>
        {SIMULATE_CLAIM ? (
          <>
            <strong style={{ color: "var(--text-secondary)" }}>Note:</strong> Inco TEE decryption is currently unstable in this environment. 
            This claim was simulated. Real TEE decryption and on-chain claim will be implemented in v2.
          </>
        ) : (
          <>
            <strong style={{ color: "var(--text-secondary)" }}>Note:</strong> This will attempt a real Inco TEE decryption and on-chain claim. 
            Ensure Inco SDK and program are available.
          </>
        )}
      </div>
    </div>
  );
}