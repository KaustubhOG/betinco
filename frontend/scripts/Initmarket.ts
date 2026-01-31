import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import BN from "bn.js";

const PROGRAM_ID = new PublicKey("H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77");
const USDC_MINT = new PublicKey("So11111111111111111111111111111111111111112"); // WSOL

async function initializeMarket(
  connection: Connection,
  payer: Keypair,
  marketId: number,
  settlementDeadline: number
) {
  const marketIdBN = new BN(marketId);
  const marketIdBuffer = Buffer.alloc(8);
  marketIdBN.toArrayLike(Buffer, "le", 8).copy(marketIdBuffer);

  const [marketPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("market"), marketIdBuffer],
    PROGRAM_ID
  );

  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), marketIdBuffer],
    PROGRAM_ID
  );

  const discriminator = Buffer.from([109, 94, 123, 185, 139, 159, 66, 75]);

  const marketIdData = Buffer.alloc(4);
  marketIdData.writeUInt32LE(marketId, 0);

  const deadlineData = Buffer.alloc(8);
  new BN(settlementDeadline).toArrayLike(Buffer, "le", 8).copy(deadlineData);

  const instructionData = Buffer.concat([
    discriminator,
    marketIdData,
    deadlineData,
  ]);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: marketPda, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: USDC_MINT, isSigner: false, isWritable: false },
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = payer.publicKey;
  transaction.recentBlockhash = (
    await connection.getLatestBlockblocker()
  ).blockhash;

  transaction.sign(payer);

  const signature = await connection.sendRawTransaction(transaction.serialize());
  await connection.confirmTransaction(signature, "confirmed");

  console.log(`✅ Market ${marketId} initialized!`);
  console.log(`Market PDA: ${marketPda.toString()}`);
  console.log(`Vault PDA: ${vaultPda.toString()}`);
  console.log(`Signature: ${signature}`);
}

async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  // REPLACE WITH YOUR KEYPAIR
  const payerSecretKey = Uint8Array.from([
    // Your wallet private key array here
  ]);
  const payer = Keypair.fromSecretKey(payerSecretKey);

  console.log("Initializing markets...");
  console.log("Payer:", payer.publicKey.toString());

  // Initialize 10 markets
  const now = Math.floor(Date.now() / 1000);
  const oneMonth = 30 * 24 * 60 * 60;

  for (let i = 1; i <= 10; i++) {
    try {
      await initializeMarket(connection, payer, i, now + oneMonth);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s between markets
    } catch (error) {
      console.error(`Failed to initialize market ${i}:`, error);
    }
  }

  console.log("✅ All markets initialized!");
}

main();