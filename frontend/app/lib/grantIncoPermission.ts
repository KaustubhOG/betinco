import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";

const PROGRAM_ID = new PublicKey("H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77");
const INCO_PROGRAM_ID = new PublicKey("5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj");

/**
 * Grant Inco decrypt permission
 * 
 * Note: This function requires @inco/solana-sdk which is currently not available.
 * For now, this is a placeholder that will be properly implemented when the SDK is available.
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

  // Fetch bet account to verify it exists
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

  console.log("🔑 Encrypted side handle:", handleLow.toString());

  // For now, throw an error since Inco SDK is not available
  // In production, this would call the Inco SDK's allow() function
  throw new Error(
    "Inco SDK is not currently available. " +
    "The permission grant functionality will be implemented when the SDK is integrated. " +
    "For now, use the simulated claim flow."
  );
}