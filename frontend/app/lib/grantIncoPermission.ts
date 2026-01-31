import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";

const PROGRAM_ID = new PublicKey("H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77");
const INCO_PROGRAM_ID = new PublicKey("5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj");

/**
 * Grant Inco decrypt permission by calling Inco Lightning program directly
 * 
 * This function:
 * 1. Fetches the bet account to get the encrypted_side handle
 * 2. Calls Inco's allow instruction to grant decrypt permission
 * 
 * NO SMART CONTRACT CHANGES NEEDED!
 * This is a frontend-only solution that uses Inco SDK's allow() function
 */
export async function grantIncoDecryptPermission(
  connection: Connection,
  wallet: AnchorWallet,
  marketId: string
): Promise<string> {
  const marketIdNum = parseInt(marketId);
  const marketIdBuf = Buffer.alloc(4);
  marketIdBuf.writeUInt32LE(marketIdNum, 0);

  const [marketPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("market"), marketIdBuf],
    PROGRAM_ID
  );

  const [betPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("bet"), marketPda.toBuffer(), wallet.publicKey.toBuffer()],
    PROGRAM_ID
  );

  // Fetch bet account to get encrypted_side handle
  console.log("📖 Fetching bet account for permission grant...");
  const betAccount = await connection.getAccountInfo(betPda);
  if (!betAccount) {
    throw new Error("No bet found. Place a bet first!");
  }

  // Parse encrypted_side handle from bet account
  const betData = betAccount.data;
  let offset = 8;    // Skip discriminator
  offset += 16;      // Skip encrypted_amount (Euint128 = 16 bytes)
  
  const encryptedSideBytes = betData.slice(offset, offset + 16);
  const handleLow = encryptedSideBytes.readBigUInt64LE(0);
  const handle = handleLow.toString();

  console.log("🔑 Encrypted side handle:", handle);

  // Derive allowance PDA
  const handleBuffer = Buffer.alloc(16);
  handleBuffer.writeBigUInt64LE(handleLow, 0);

  const [allowancePda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("allowance"),
      handleBuffer,
      wallet.publicKey.toBuffer(),
    ],
    INCO_PROGRAM_ID
  );

  console.log("🔐 Allowance PDA:", allowancePda.toBase58());

  // Call Inco's allow instruction directly using the SDK
  console.log("⚡ Calling Inco SDK allow()...");
  
  try {
    // Try to import and use Inco SDK's allow function
    const { allow } = await import("@inco/solana-sdk/instructions");
    
    const signature = await allow({
      connection,
      wallet,
      handle: handleLow,  // Pass the handle as BigInt or number
      allowedAddress: wallet.publicKey,
    });

    console.log("✅ Permission granted via Inco SDK:", signature);
    return signature;
  } catch (sdkError: any) {
    console.error("❌ Inco SDK allow() failed:", sdkError);
    
    // Fallback: Try manual instruction building
    console.log("🔄 Attempting manual Inco allow instruction...");
    
    const { allowIncoHandle } = await import("./manualIncoAllow");
    const signature = await allowIncoHandle(
      connection,
      wallet,
      handleLow,
      allowancePda
    );
    
    console.log("✅ Permission granted via manual instruction:", signature);
    return signature;
  }
}