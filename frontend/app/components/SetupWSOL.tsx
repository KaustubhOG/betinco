// "use client";

// import { useState } from "react";
// import { useWallet } from "@solana/wallet-adapter-react";
// import {
//   Connection,
//   PublicKey,
//   Transaction,
//   SystemProgram,
// } from "@solana/web3.js";
// import {
//   getAssociatedTokenAddressSync,
//   createAssociatedTokenAccountInstruction,
//   createSyncNativeInstruction,
//   TOKEN_PROGRAM_ID,
//   NATIVE_MINT,
//   getAccount,
// } from "@solana/spl-token";

// export default function SetupWSOL() {
//   const wallet = useWallet();
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [wrapAmount, setWrapAmount] = useState("0.1"); // Amount of SOL to wrap

//   const setupAndWrapSOL = async () => {
//     if (!wallet.publicKey || !wallet.signTransaction) {
//       alert("Please connect your wallet");
//       return;
//     }

//     const amount = parseFloat(wrapAmount);
//     if (amount <= 0) {
//       alert("Please enter a valid amount");
//       return;
//     }

//     setLoading(true);
//     setSuccess(false);

//     try {
//       const connection = new Connection("https://api.devnet.solana.com", "confirmed");

//       // Get the WSOL associated token account address
//       const wsolAccount = getAssociatedTokenAddressSync(
//         NATIVE_MINT,
//         wallet.publicKey
//       );

//       console.log("Your WSOL Account:", wsolAccount.toString());

//       const transaction = new Transaction();
      
//       // Check if WSOL account exists
//       const accountInfo = await connection.getAccountInfo(wsolAccount);
      
//       if (!accountInfo) {
//         console.log("Creating WSOL account...");
//         // Create the associated token account for WSOL
//         transaction.add(
//           createAssociatedTokenAccountInstruction(
//             wallet.publicKey,
//             wsolAccount,
//             wallet.publicKey,
//             NATIVE_MINT
//           )
//         );
//       } else {
//         console.log("WSOL account already exists");
//       }

//       // Convert SOL to lamports (1 SOL = 1_000_000_000 lamports)
//       const lamports = Math.floor(amount * 1_000_000_000);

//       console.log(`Wrapping ${amount} SOL (${lamports} lamports)`);

//       // Transfer SOL to the WSOL account
//       transaction.add(
//         SystemProgram.transfer({
//           fromPubkey: wallet.publicKey,
//           toPubkey: wsolAccount,
//           lamports: lamports,
//         })
//       );

//       // Sync the native balance to make it available as SPL tokens
//       transaction.add(
//         createSyncNativeInstruction(wsolAccount)
//       );

//       transaction.feePayer = wallet.publicKey;
//       transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

//       const signed = await wallet.signTransaction(transaction);
//       const signature = await connection.sendRawTransaction(signed.serialize());

//       console.log("Transaction sent:", signature);
//       await connection.confirmTransaction(signature, "confirmed");

//       // Verify the wrapped amount
//       const tokenAccount = await getAccount(connection, wsolAccount);
//       console.log(`✅ Successfully wrapped ${amount} SOL!`);
//       console.log(`WSOL Balance: ${Number(tokenAccount.amount) / 1_000_000_000} SOL`);

//       setSuccess(true);
//     } catch (error: any) {
//       console.error("Error setting up WSOL:", error);
//       alert(`Failed to setup WSOL: ${error.message || "Unknown error"}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{
//       border: "2px solid #f59e0b",
//       borderRadius: "12px",
//       padding: "24px",
//       maxWidth: "500px",
//       margin: "20px auto",
//       background: "#fffbeb"
//     }}>
//       <h3 style={{ marginTop: 0 }}>⚠️ Setup Required: Wrap SOL to WSOL</h3>
      
//       <p style={{ margin: "16px 0", fontSize: "14px" }}>
//         Before you can place bets, you need to wrap your SOL into WSOL (Wrapped SOL). 
//         This converts your native SOL into an SPL token that can be used for betting.
//       </p>

//       <div style={{
//         background: "#fef3c7",
//         padding: "12px",
//         borderRadius: "8px",
//         marginBottom: "16px",
//         fontSize: "13px"
//       }}>
//         <strong>💡 What is WSOL?</strong>
//         <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
//           <li>WSOL = Wrapped SOL (SPL Token version)</li>
//           <li>Your SOL stays in your wallet, just wrapped</li>
//           <li>You can unwrap it back to SOL anytime</li>
//           <li>Required for SPL token transfers in smart contracts</li>
//         </ul>
//       </div>

//       <div style={{ marginBottom: "20px" }}>
//         <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
//           Amount of SOL to Wrap
//         </label>
//         <input
//           type="number"
//           value={wrapAmount}
//           onChange={(e) => setWrapAmount(e.target.value)}
//           placeholder="Enter SOL amount"
//           min="0.01"
//           step="0.01"
//           style={{
//             width: "100%",
//             padding: "12px",
//             fontSize: "16px",
//             border: "2px solid #f59e0b",
//             borderRadius: "8px"
//           }}
//         />
//         <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
//           Recommended: 0.1 SOL or more for multiple bets
//         </div>
//       </div>

//       <button
//         onClick={setupAndWrapSOL}
//         disabled={loading || !wallet.publicKey}
//         style={{
//           width: "100%",
//           padding: "16px",
//           background: loading ? "#9ca3af" : "#f59e0b",
//           color: "#fff",
//           border: "none",
//           borderRadius: "8px",
//           cursor: loading ? "not-allowed" : "pointer",
//           fontSize: "18px",
//           fontWeight: 600
//         }}
//       >
//         {loading ? "Wrapping SOL..." : `Wrap ${wrapAmount} SOL to WSOL`}
//       </button>

//       {success && (
//         <div style={{
//           marginTop: "16px",
//           padding: "12px",
//           background: "#dcfce7",
//           color: "#16a34a",
//           borderRadius: "8px",
//           textAlign: "center",
//           fontWeight: 600
//         }}>
//           ✅ Successfully wrapped {wrapAmount} SOL! You can now place bets.
//         </div>
//       )}

//       <div style={{
//         marginTop: "16px",
//         padding: "12px",
//         background: "#e0e7ff",
//         borderRadius: "8px",
//         fontSize: "12px"
//       }}>
//         <strong>📝 Steps:</strong>
//         <ol style={{ margin: "8px 0", paddingLeft: "20px" }}>
//           <li>Enter the amount of SOL to wrap (e.g., 0.1 SOL)</li>
//           <li>Click "Wrap SOL to WSOL"</li>
//           <li>Approve the transaction in your wallet</li>
//           <li>Wait for confirmation (~5 seconds)</li>
//           <li>Start betting!</li>
//         </ol>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  getAccount,
} from "@solana/spl-token";

export default function SetupWSOL() {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [wrapAmount, setWrapAmount] = useState("0.1"); // Amount of SOL to wrap

  const setupAndWrapSOL = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      alert("Please connect your wallet");
      return;
    }

    const amount = parseFloat(wrapAmount);
    if (amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");

      // Get the WSOL associated token account address
      const wsolAccount = getAssociatedTokenAddressSync(
        NATIVE_MINT,
        wallet.publicKey
      );

      console.log("Your WSOL Account:", wsolAccount.toString());

      const transaction = new Transaction();
      
      // Check if WSOL account exists
      const accountInfo = await connection.getAccountInfo(wsolAccount);
      
      if (!accountInfo) {
        console.log("Creating WSOL account...");
        // Create the associated token account for WSOL
        transaction.add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            wsolAccount,
            wallet.publicKey,
            NATIVE_MINT
          )
        );
      } else {
        console.log("WSOL account already exists");
      }

      // Convert SOL to lamports (1 SOL = 1_000_000_000 lamports)
      const lamports = Math.floor(amount * 1_000_000_000);

      console.log(`Wrapping ${amount} SOL (${lamports} lamports)`);

      // Transfer SOL to the WSOL account
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wsolAccount,
          lamports: lamports,
        })
      );

      // Sync the native balance to make it available as SPL tokens
      transaction.add(
        createSyncNativeInstruction(wsolAccount)
      );

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());

      console.log("Transaction sent:", signature);
      await connection.confirmTransaction(signature, "confirmed");

      // Verify the wrapped amount
      const tokenAccount = await getAccount(connection, wsolAccount);
      console.log(`✅ Successfully wrapped ${amount} SOL!`);
      console.log(`WSOL Balance: ${Number(tokenAccount.amount) / 1_000_000_000} SOL`);

      setSuccess(true);
    } catch (error: any) {
      console.error("Error setting up WSOL:", error);
      alert(`Failed to setup WSOL: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      border: "2px solid #f59e0b",
      borderRadius: "12px",
      padding: "24px",
      maxWidth: "500px",
      margin: "20px auto",
      background: "#1a1a1a"
    }}>
      <h3 style={{ marginTop: 0, color: "#ffffff" }}>⚠️ Setup Required: Wrap SOL to WSOL</h3>
      
      <p style={{ margin: "16px 0", fontSize: "14px", color: "#d1d5db" }}>
        Before you can place bets, you need to wrap your SOL into WSOL (Wrapped SOL). 
        This converts your native SOL into an SPL token that can be used for betting.
      </p>

      <div style={{
        background: "#2d2d2d",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "16px",
        fontSize: "13px",
        color: "#e5e7eb"
      }}>
        <strong style={{ color: "#fbbf24" }}>💡 What is WSOL?</strong>
        <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
          <li>WSOL = Wrapped SOL (SPL Token version)</li>
          <li>Your SOL stays in your wallet, just wrapped</li>
          <li>You can unwrap it back to SOL anytime</li>
          <li>Required for SPL token transfers in smart contracts</li>
        </ul>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#f3f4f6" }}>
          Amount of SOL to Wrap
        </label>
        <input
          type="number"
          value={wrapAmount}
          onChange={(e) => setWrapAmount(e.target.value)}
          placeholder="Enter SOL amount"
          min="0.01"
          step="0.01"
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            border: "2px solid #f59e0b",
            borderRadius: "8px",
            background: "#2d2d2d",
            color: "#ffffff"
          }}
        />
        <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
          Recommended: 0.1 SOL or more for multiple bets
        </div>
      </div>

      <button
        onClick={setupAndWrapSOL}
        disabled={loading || !wallet.publicKey}
        style={{
          width: "100%",
          padding: "16px",
          background: loading ? "#4b5563" : "#f59e0b",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "18px",
          fontWeight: 600
        }}
      >
        {loading ? "Wrapping SOL..." : `Wrap ${wrapAmount} SOL to WSOL`}
      </button>

      {success && (
        <div style={{
          marginTop: "16px",
          padding: "12px",
          background: "#1e3a2e",
          color: "#4ade80",
          borderRadius: "8px",
          textAlign: "center",
          fontWeight: 600,
          border: "1px solid #22c55e"
        }}>
          ✅ Successfully wrapped {wrapAmount} SOL! You can now place bets.
        </div>
      )}

      <div style={{
        marginTop: "16px",
        padding: "12px",
        background: "#1e293b",
        borderRadius: "8px",
        fontSize: "12px",
        color: "#cbd5e1"
      }}>
        <strong style={{ color: "#93c5fd" }}>📝 Steps:</strong>
        <ol style={{ margin: "8px 0", paddingLeft: "20px" }}>
          <li>Enter the amount of SOL to wrap (e.g., 0.1 SOL)</li>
          <li>Click "Wrap SOL to WSOL"</li>
          <li>Approve the transaction in your wallet</li>
          <li>Wait for confirmation (~5 seconds)</li>
          <li>Start betting!</li>
        </ol>
      </div>
    </div>
  );
}