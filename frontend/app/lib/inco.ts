import { PublicKey } from "@solana/web3.js";

export async function encryptBetData(
  amount: number,
  side: number,
  userPublicKey: PublicKey
): Promise<{
  encryptedAmount: Buffer;
  encryptedSide: Buffer;
}> {
  console.log("🔒 Inco FHE Encryption START");
  console.log("Amount:", amount, "Side:", side);

  try {
    // Import Inco SDK
    const { encryptValue } = await import("@inco/solana-sdk/encryption");
    const { hexToBuffer } = await import("@inco/solana-sdk/utils");

    const amountBigInt = BigInt(amount);
    const sideBigInt = BigInt(side);

    console.log("Encrypting with Inco FHE...");
    
    // Real FHE encryption via Inco
    const encryptedAmountHex = await encryptValue(amountBigInt);
    const encryptedSideHex = await encryptValue(sideBigInt);

    const encryptedAmount = hexToBuffer(encryptedAmountHex);
    const encryptedSide = hexToBuffer(encryptedSideHex);

    console.log("✅ Inco FHE Encryption SUCCESS");
    console.log("Encrypted sizes - Amount:", encryptedAmount.length, "Side:", encryptedSide.length);

    return {
      encryptedAmount,
      encryptedSide,
    };
  } catch (error: any) {
    console.error("❌ Inco SDK Error:", error);
    throw new Error(`Inco encryption failed: ${error.message}. Make sure @inco/solana-sdk is installed.`);
  }
}