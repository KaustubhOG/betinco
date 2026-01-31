import { Connection, PublicKey } from "@solana/web3.js";

export const connection = new Connection(
  "https://api.devnet.solana.com",
  "confirmed"
);

export const PROGRAM_ID = new PublicKey(
  "H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77"
);

export const MARKET_PDA = new PublicKey(
  "BRvwTpXNoVxk1A8uhWsazwWnCnq7AeVpcV8rDrLeAXZw"
);

export const COLLATERAL_VAULT = new PublicKey(
  "AjLdoJGu8iRT2S68kF894PCfpHZtSU93akk94ZgRBaKP"
);

export const USDC_MINT = new PublicKey(
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);
