import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey(
  "H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77",
);

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = await anchor.Program.at(PROGRAM_ID, provider);

  const marketId = 1;
  const settlementDeadline = new anchor.BN(
    Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  );

  const marketIdBuf = Buffer.from(
    new Uint8Array(new Uint32Array([marketId]).buffer),
  );

  const [marketPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("market"), marketIdBuf],
    PROGRAM_ID,
  );

  const [collateralVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), marketIdBuf],
    PROGRAM_ID,
  );

  console.log("Market PDA:", marketPda.toBase58());
  console.log("Collateral Vault:", collateralVault.toBase58());

  await program.methods
    .initializeMarket(marketId, settlementDeadline)
    .accounts({
      market: marketPda,
      authority: provider.wallet.publicKey,
      collateralMint: new PublicKey(
        "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
      ),

      collateralVault,
      outcomeAMint: anchor.web3.Keypair.generate().publicKey,
      outcomeBMint: anchor.web3.Keypair.generate().publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .rpc();

  console.log(" Market initialized");
}

main().catch(console.error);
