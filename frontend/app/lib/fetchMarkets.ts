import { Connection, PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77");
const HELIUS_RPC = "https://devnet.helius-rpc.com/?api-key=921ba1f0-fa17-4803-8417-e8c04743d961";

// Market discriminator
const MARKET_DISCRIMINATOR = [219, 190, 213, 55, 0, 227, 198, 154];

export interface MarketData {
  id: string;
  question: string;
  deadline: number;
  isSettled: boolean;
  authority: string;
  winningOutcome?: string;
}

function parseMarketAccount(data: Buffer): MarketData | null {
  try {
    // Verify discriminator
    const disc = Array.from(data.slice(0, 8));
    const discMatch = disc.every((byte, i) => byte === MARKET_DISCRIMINATOR[i]);
    if (!discMatch) return null;

    let offset = 8;

    // Authority (32 bytes)
    const authority = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;

    // Market ID (u32, 4 bytes)
    const marketId = data.readUInt32LE(offset);
    offset += 4;

    // Question (String: u32 length + bytes)
    const questionLen = data.readUInt32LE(offset);
    offset += 4;
    const question = data.slice(offset, offset + questionLen).toString('utf-8');
    offset += questionLen;

    // Settlement deadline (i64, 8 bytes)
    const deadline = Number(data.readBigInt64LE(offset));
    offset += 8;

    // Collateral mint (32 bytes)
    offset += 32;

    // Collateral vault (32 bytes)
    offset += 32;

    // Is settled (bool, 1 byte)
    const isSettled = data[offset] === 1;
    offset += 1;

    // Winning outcome (Option<enum>)
    const hasOutcome = data[offset];
    offset += 1;
    
    let winningOutcome: string | undefined;
    if (hasOutcome === 1) {
      const outcomeVariant = data[offset];
      const outcomes = ["YES", "NO", "DRAW"];
      winningOutcome = outcomes[outcomeVariant] || "Unknown";
      offset += 1;
    }

    return {
      id: marketId.toString(),
      question: question || `Market ${marketId}`,
      deadline,
      isSettled,
      authority: authority.toBase58(),
      winningOutcome,
    };
  } catch (error) {
    console.error("Error parsing market account:", error);
    return null;
  }
}

export async function fetchAllMarkets(): Promise<MarketData[]> {
  try {
    console.log("📡 Fetching markets from", PROGRAM_ID.toBase58());
    const connection = new Connection(HELIUS_RPC, "confirmed");
    
    const accounts = await connection.getProgramAccounts(PROGRAM_ID);
    console.log("📦 Found", accounts.length, "accounts");

    const markets: MarketData[] = [];

    for (const account of accounts) {
      const market = parseMarketAccount(account.account.data);
      if (market) {
        console.log(`Market ${market.id}: settled=${market.isSettled}, outcome=${market.winningOutcome}`);
        markets.push(market);
      }
    }

    console.log("📊 Total markets:", markets.length);
    const settled = markets.filter(m => m.isSettled);
    console.log("✅ Settled markets:", settled.length);
    
    return markets.sort((a, b) => Number(b.id) - Number(a.id));
  } catch (error) {
    console.error("❌ Error fetching markets:", error);
    return [];
  }
}

export async function fetchSettledMarkets(): Promise<MarketData[]> {
  try {
    console.log("🔍 Fetching settled markets...");
    const allMarkets = await fetchAllMarkets();
    const settled = allMarkets.filter(m => m.isSettled === true);
    console.log("✅ Found", settled.length, "settled markets");
    
    settled.forEach(m => {
      console.log(`  Market ${m.id}: ${m.question} - Winner: ${m.winningOutcome}`);
    });
    
    return settled;
  } catch (error) {
    console.error("❌ Error fetching settled markets:", error);
    return [];
  }
}

export async function fetchMarketDetails(marketId: number): Promise<MarketData | null> {
  try {
    console.log("🔎 Fetching market", marketId);
    const connection = new Connection(HELIUS_RPC, "confirmed");
    
    const marketIdBuf = Buffer.alloc(4);
    marketIdBuf.writeUInt32LE(marketId, 0);

    const [marketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), marketIdBuf],
      PROGRAM_ID
    );

    const account = await connection.getAccountInfo(marketPda);
    if (!account) {
      console.log("❌ Market not found");
      return null;
    }

    const market = parseMarketAccount(account.data);
    console.log("✅ Market details:", market);
    return market;
  } catch (error) {
    console.error("❌ Error fetching market:", error);
    return null;
  }
}