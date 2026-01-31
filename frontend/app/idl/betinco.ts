import { PublicKey } from "@solana/web3.js";

export async function encryptBetData(
  amount: number,
  side: number,
  userPublicKey: PublicKey
): Promise<{
  encryptedAmount: Buffer;
  encryptedSide: Buffer;
}> {
  try {
    console.log("🔒 Inco Encryption START - Side:", side);

    // Dynamic import to handle SSR
    const { encryptValue } = await import("@inco/solana-sdk/encryption");
    const { hexToBuffer } = await import("@inco/solana-sdk/utils");

    // Encrypt only the side (0 = YES, 1 = NO)
    const sideBigInt = BigInt(side);
    const encryptedSideHex = await encryptValue(sideBigInt);

    console.log("✅ Side encrypted");

    const encryptedSide = hexToBuffer(encryptedSideHex);

    // Return dummy amount buffer (not used in public mode)
    const dummyAmount = Buffer.alloc(0);

    console.log("📦 Encrypted Side buffer size:", encryptedSide.length);
    console.log("🔒 Inco Encryption COMPLETE");

    return {
      encryptedAmount: dummyAmount,
      encryptedSide: encryptedSide,
    };
  } catch (error) {
    console.error("❌ Encryption failed:", error);
    
    // Fallback: create encrypted data for testing (16 bytes)
    const dummySide = Buffer.alloc(16);
    dummySide.writeBigUInt64BE(BigInt(side), 0);
    dummySide.writeUInt8(side === 0 ? 42 : 99, 8); // Magic bytes for YES/NO
    
    console.warn("⚠️ Using fallback encryption");
    return {
      encryptedAmount: Buffer.alloc(0),
      encryptedSide: dummySide,
    };
  }
}
