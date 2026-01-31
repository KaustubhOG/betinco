# 🔮 BetInco - Privacy-Preserving Prediction Markets

<div align="center">

![BetInco Banner](https://img.shields.io/badge/BetInco-Privacy%20First-blueviolet?style=for-the-badge)
[![Solana](https://img.shields.io/badge/Solana-Devnet-14F195?style=for-the-badge&logo=solana)](https://solana.com)
[![Inco FHE](https://img.shields.io/badge/Inco-FHE%20Powered-FF6B6B?style=for-the-badge)](https://inco.org)
[![Anchor](https://img.shields.io/badge/Anchor-v0.29.0-purple?style=for-the-badge)](https://www.anchor-lang.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**A decentralized prediction market built on Solana with Fully Homomorphic Encryption (FHE) for complete bet privacy**

[Live Demo](https://drive.google.com/file/d/1nvwFvUjSg8eaQ7VX8WHMZitty-LIGeeM/view) • [Documentation](#-documentation) • [Architecture](#-architecture) • [Quick Start](#-quick-start)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Why BetInco?](#-why-betinco)
- [Version Roadmap](#-version-roadmap)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Inco FHE Integration](#-inco-fhe-integration)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Smart Contract](#-smart-contract)
- [Frontend](#-frontend)
- [How It Works](#-how-it-works)
- [Security Model](#-security-model)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**BetInco** is a next-generation prediction market platform that leverages **Inco Network's Fully Homomorphic Encryption (FHE)** to enable completely private betting on Solana. Users can place bets on binary outcomes (YES/NO) while keeping their choices encrypted on-chain until they claim rewards.

### Program ID (Solana Devnet)
```
H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77
```
###LIVE DEMO: https://drive.google.com/file/d/1nvwFvUjSg8eaQ7VX8WHMZitty-LIGeeM/view

### ⚠️ IMPORTANT: WSOL Required for Betting

> **Before placing any bets, you MUST convert your SOL to Wrapped SOL (WSOL)**
> 
> BetInco uses **WSOL (Wrapped SOL)** as the betting token, not native SOL. This is because:
> - SPL Token Program requires wrapped tokens for PDA vault transfers
> - WSOL ensures consistent token handling across all markets
> - Prevents issues with native SOL account ownership
>
> **How to wrap SOL:**
> 1. Use [Raydium](https://raydium.io/swap/) to swap SOL → WSOL
> 2. Or use Phantom wallet's built-in wrap feature
> 3. Or use CLI: `spl-token wrap <amount> --url devnet`
>
> **Direct SOL deposits are NOT supported and will fail!**

### Why Helius RPC?

We use **Helius RPC** instead of the default Solana devnet RPC for several critical reasons:

- **🚀 Reliability**: Public devnet RPCs are heavily congested with excessive traffic from multiple projects
- **⚡ Performance**: Helius provides dedicated endpoints with better rate limits and lower latency
- **🔄 Transaction Success**: Higher transaction confirmation rates compared to cluttered public endpoints
- **📊 Enhanced Features**: Access to webhooks, historical data, and improved WebSocket support
- **🛡️ Stability**: Reduced downtime and better SLA for development and testing

---

## 💡 Why BetInco?

### The Problem with Traditional Prediction Markets

Traditional blockchain prediction markets suffer from critical privacy issues:

| Issue | Impact |
|-------|--------|
| **🔍 Bet Transparency** | Anyone can see your betting position in real-time |
| **🎯 Front-Running** | Large bets can be front-run by MEV bots |
| **📊 Market Manipulation** | Visible betting patterns enable coordinated manipulation |
| **💼 Competitive Disadvantage** | Institutional players can track and counter your strategy |
| **🎲 Information Leakage** | Your bet reveals your private information/analysis |

### Our Solution: Privacy-First Design

BetInco solves these problems using **Inco Network's FHE technology**:

✅ **Encrypted Bets** - Your bet choice (YES/NO) is encrypted on-chain  
✅ **Zero Knowledge** - No one can see your position until settlement  
✅ **Fair Markets** - Prevents front-running and manipulation  
✅ **Cryptographic Security** - TEE (Trusted Execution Environment) attestation  
✅ **Decentralized** - No central authority can access your private data  

---

## 🗺️ Version Roadmap

### 📦 V1 (Current Version) - Foundation

**Status**: ✅ **Live on Devnet**

V1 establishes the core prediction market infrastructure with **partial FHE integration**:

#### What's Included in V1:
- ✅ Binary prediction markets (YES/NO outcomes)
- ✅ Market creation and settlement by authorized operators
- ✅ Public betting with transparent amounts
- ✅ **Encrypted bet side storage** using Inco FHE `Euint128` handles
- ✅ Smart contract infrastructure for private claims
- ✅ Basic reward distribution mechanism
- ✅ Frontend interface for betting and market viewing

#### V1 Limitations:

> **⚠️ IMPORTANT: V1 Does NOT Support Full TEE-Based Claim Rewards**
>
> Due to **limited Inco Network TEE coprocessor availability on Solana Devnet**, V1 implements a **simplified claim mechanism** without full cryptographic attestation. This is a temporary limitation for development and testing purposes.

**Why No TEE in V1?**
- Inco's TEE (Trusted Execution Environment) coprocessor infrastructure is still in early development for Solana
- Devnet TEE endpoints are unreliable and frequently unavailable
- Ed25519 signature verification requires stable TEE attestation service
- V1 focuses on proving the core market mechanism before full privacy deployment

**What This Means:**
- Bet sides are still encrypted and stored as `Euint128` handles on-chain
- Claims in V1 use a simplified verification (no TEE decryption required)
- **This is intentional for V1 testing and development**

---

### 🚀 V2 (Planned) - Full Privacy Suite

**Status**: 🔄 **In Development**

V2 will implement **complete end-to-end encryption** with full TEE infrastructure:

#### Planned V2 Features:
- 🔐 **Fully Encrypted Betting** - Both amount AND side encrypted
- 🛡️ **TEE-Based Claim Rewards** - Full Ed25519 signature verification
- ⚡ **Inco Coprocessor Integration** - Real TEE decryption on claim
- 🔒 **Complete Privacy** - Zero information leakage before settlement
- 📝 **Cryptographic Proofs** - Verifiable decryption without trust
- 🌐 **Mainnet Deployment** - Production-ready with stable TEE infrastructure

#### V2 Technical Improvements:
```rust
// V1: Simplified claim
pub fn claim_simplified(ctx: Context<Claim>, market_id: u32) -> Result<()>

// V2: Full TEE-attested claim
pub fn claim_private(
    ctx: Context<ClaimPrivate>,
    market_id: u32,
    num_handles: u8,
    handle_buffers: Vec<Vec<u8>>,      // Encrypted handles
    plaintext_buffers: Vec<Vec<u8>>,   // TEE-decrypted plaintexts
    ed25519_instructions: Vec<...>,    // Cryptographic signatures
) -> Result<()>
```

**V2 Timeline**: Expected Q2 2026 (pending Inco mainnet TEE availability)

---

## ✨ Key Features

### Current V1 Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Binary Markets** | Create YES/NO prediction markets | ✅ Live |
| **Encrypted Storage** | Bet sides stored as FHE handles | ✅ Live |
| **Market Settlement** | Authorized outcome declaration | ✅ Live |
| **Reward Claims** | Simplified claim mechanism | ✅ Live |
| **WSOL Support** | Wrapped SOL as collateral | ✅ Live |
| **Helius RPC** | Fast, reliable devnet access | ✅ Live |

### Coming in V2

| Feature | Description | Status |
|---------|-------------|--------|
| **Full FHE Encryption** | Amount + Side encrypted | 🔄 Planned |
| **TEE Decryption** | Secure claim with attestation | 🔄 Planned |
| **Ed25519 Verification** | Cryptographic proof system | 🔄 Planned |
| **Zero-Knowledge Claims** | Trustless reward distribution | 🔄 Planned |

---

## 🛠️ Technology Stack

### Blockchain & Smart Contracts
- **Solana** - High-performance blockchain (Devnet)
- **Anchor Framework v0.29.0** - Solana program development
- **Rust** - Smart contract programming language
- **Inco Lightning** - FHE encryption library for Solana

### Privacy & Cryptography
- **Inco Network FHE** - Fully Homomorphic Encryption
- **Euint128** - Encrypted integer handles (16 bytes)
- **TEE (Planned V2)** - Trusted Execution Environment
- **Ed25519 (Planned V2)** - Signature verification

### Frontend
- **React.js** - UI framework
- **Next.js / Vite** - Build tooling
- **@solana/web3.js** - Solana JavaScript SDK
- **@coral-xyz/anchor** - Anchor client library
- **@inco/solana-sdk** - Inco FHE encryption SDK
- **TailwindCSS** - Styling

### Infrastructure
- **Helius RPC** - Reliable Solana devnet access
- **Phantom Wallet** - Web3 wallet integration
- **Vercel** - Frontend deployment (optional)

---

## 🏗️ Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                      (React Frontend)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Create Market│  │  Place Bet   │  │ Claim Rewards│          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │                  │ [V1: Simplified] │
          │                  │ [V2: TEE-Based]  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   HELIUS RPC ENDPOINT                            │
│              (Fast, Reliable Devnet Access)                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SOLANA BLOCKCHAIN                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              BetInco Smart Contract                       │  │
│  │        (Program: H5xTV9x61nDR2kLTKXekM4YntaNUpCNE...)     │  │
│  │                                                           │  │
│  │  ┌─────────────────┐      ┌──────────────────────┐      │  │
│  │  │ Market Accounts │      │   Bet Data Accounts  │      │  │
│  │  │ - Question      │      │ - encrypted_side     │      │  │
│  │  │ - Deadline      │      │   (Euint128 handle)  │      │  │
│  │  │ - Vault         │      │ - amount (public)    │      │  │
│  │  │ - Winner        │      │ - claimed status     │      │  │
│  │  └─────────────────┘      └──────────────────────┘      │  │
│  │                                                           │  │
│  │  [V2 Will Include Full TEE Integration Here]             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
          │                                          ▲
          │ CPI Call                                 │ [V2 Only]
          ▼                                          │
┌─────────────────────────────────────────────────────────────────┐
│                  INCO LIGHTNING PROGRAM                          │
│               (FHE Encryption Operations)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  new_euint128() - Creates encrypted integer handle       │  │
│  │  Returns: Euint128 { 0: u128 } - 16 byte handle          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [V2: Full TEE Coprocessor Integration]                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  TEE Coprocessor (Planned V2)                            │  │
│  │  - Secure decryption in isolated environment            │  │
│  │  - Ed25519 signature generation                         │  │
│  │  - Cryptographic attestation                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Inco FHE Integration

### What is Inco FHE?

**Inco Network** provides **Fully Homomorphic Encryption (FHE)** infrastructure for blockchains, enabling computation on encrypted data without decryption.

### How BetInco Uses FHE

#### V1 Implementation (Current)

```rust
// Smart Contract - Storing encrypted bet side
use inco_lightning::types::Euint128;

#[account]
pub struct BetData {
    pub encrypted_side: Euint128,    // 🔒 16-byte handle to encrypted YES(0)/NO(1)
    pub amount: u64,                 // Public bet amount
    pub is_private_mode: bool,       // Privacy flag
    pub claimed: bool,               // Claim status
    pub bump: u8,
}

// Creating encrypted handle via CPI
let encrypted_side_handle = inco_lightning::cpi::new_euint128(
    cpi_ctx,
    &encrypted_bet_data[16..32], // 16 bytes of encrypted data
)?;
```

#### Frontend Encryption (V1)

```typescript
import { encryptValue } from '@inco/solana-sdk';

// Encrypt bet side: 0 = YES, 1 = NO
const betSide = userChoice === 'YES' ? 0 : 1;

const encryptedData = await encryptValue(
    betSide,           // Plaintext value
    userPublicKey,     // User's Solana public key
    'euint128'         // Encryption type
);

// encryptedData is a Buffer (32 bytes total)
// First 16 bytes: encrypted amount (unused in V1)
// Last 16 bytes: encrypted side (YES/NO)
```

### FHE Data Flow (V1)

```
┌──────────────────────────────────────────────────────────────┐
│  STEP 1: User Selects Bet                                    │
│  ┌────────────┐                                              │
│  │ User picks │ → YES (0) or NO (1)                          │
│  │  YES / NO  │                                              │
│  └────────────┘                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 2: Frontend Encryption (Inco SDK)                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ encryptValue(0 or 1, publicKey, 'euint128')           │  │
│  │ Returns: Buffer(32 bytes)                             │  │
│  │   - Bytes 0-15:  encrypted amount (unused in V1)      │  │
│  │   - Bytes 16-31: encrypted side (used ✓)             │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────┘
                       │ Send in transaction
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 3: Smart Contract Processing                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ place_bet_private(encrypted_data: Vec<u8>)            │  │
│  │                                                        │  │
│  │ // Extract encrypted side (bytes 16-31)               │  │
│  │ let side_bytes = &encrypted_data[16..32];             │  │
│  │                                                        │  │
│  │ // CPI to Inco Lightning                              │  │
│  │ let handle = inco_lightning::new_euint128(side_bytes)?;│  │
│  │                                                        │  │
│  │ // Store handle (16 bytes) in BetData account         │  │
│  │ bet_account.encrypted_side = handle; // Euint128(u128)│  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 4: On-Chain Storage                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ BetData PDA Account                                    │  │
│  │ ├─ encrypted_side: Euint128 { 0: 12847563... }        │  │
│  │ ├─ amount: 1000000000 (1 SOL, public)                 │  │
│  │ ├─ is_private_mode: true                              │  │
│  │ └─ claimed: false                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  🔒 The actual encrypted data lives in Inco's coprocessor    │
│  📌 Only the 16-byte HANDLE is stored on-chain               │
└───────────────────────────────────────────────────────────────┘
```

### V2 Enhancement: Full TEE Integration

In V2, the claim process will use **TEE (Trusted Execution Environment)** for secure decryption:

```typescript
// V2 Claim Process (Planned)
import { decrypt } from '@inco/solana-sdk/attested-decrypt';

// 1. Fetch encrypted handle from on-chain
const betAccount = await program.account.betData.fetch(betPda);
const encryptedSideHandle = betAccount.encryptedSide;

// 2. Request TEE decryption
const decryptResult = await decrypt({
    handles: [encryptedSideHandle],  // Handle to decrypt
    userKeypair: wallet.keypair,     // Authorization
});

// 3. TEE returns:
// - plaintext: decrypted value (0 or 1)
// - ed25519Instruction: cryptographic signature proving correct decryption

// 4. Build transaction with Ed25519 verification
const tx = new Transaction();
tx.add(decryptResult.ed25519Instructions[0]);  // Signature verification
tx.add(await program.methods.claimPrivate(
    marketId,
    decryptResult.plaintextBuffers,
    decryptResult.handleBuffers,
).instruction());

await sendTransaction(tx);
```

### Key FHE Concepts

| Concept | Explanation |
|---------|-------------|
| **Euint128** | Encrypted unsigned 128-bit integer (stores as 16-byte handle) |
| **Handle** | Reference to encrypted data in Inco coprocessor (not the data itself) |
| **CPI** | Cross-Program Invocation to Inco Lightning for encryption ops |
| **TEE** | Trusted Execution Environment for secure decryption (V2) |
| **Ed25519** | Signature algorithm for proving correct decryption (V2) |

---

## 📁 Project Structure

```
betinco/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── MarketCard.tsx
│   │   │   ├── BetForm.tsx
│   │   │   └── ClaimRewards.tsx
│   │   ├── lib/
│   │   │   ├── inco.ts         # Inco FHE encryption utilities
│   │   │   ├── solana.ts       # Solana connection & wallet
│   │   │   └── anchor.ts       # Anchor program interaction
│   │   ├── idl/
│   │   │   └── betinco.json    # Program IDL
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── smartcontract/              # Anchor smart contract
│   ├── programs/
│   │   └── betinco/
│   │       ├── src/
│   │       │   ├── lib.rs      # Program entry point
│   │       │   ├── state.rs    # Account structures
│   │       │   ├── instructions/
│   │       │   │   ├── initialize_market.rs
│   │       │   │   ├── place_bet_private.rs
│   │       │   │   ├── set_winning_side.rs
│   │       │   │   └── claim_simplified.rs  # V1 claim
│   │       │   ├── errors.rs   # Custom errors
│   │       │   └── constants.rs
│   │       └── Cargo.toml
│   ├── tests/
│   │   └── betinco.ts          # Integration tests
│   ├── migrations/
│   ├── Anchor.toml
│   └── Cargo.toml
│
├── .env.example                # Environment variables template
├── README.md                   # This file
└── LICENSE
```

---

## 📋 Prerequisites

Before running BetInco, ensure you have:

### Required Software

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **Rust** v1.75+ ([Install](https://rustup.rs/))
- **Solana CLI** v1.18+ ([Install](https://docs.solana.com/cli/install-solana-cli-tools))
- **Anchor CLI** v0.29.0 ([Install](https://www.anchor-lang.com/docs/installation))
- **Git** ([Download](https://git-scm.com/))

### Accounts & Keys

- **Solana Wallet** with devnet SOL ([Faucet](https://faucet.solana.com/))
- **Phantom Wallet** browser extension ([Download](https://phantom.app/))
- **Helius API Key** (Free tier) ([Get here](https://www.helius.dev/))

### Check Installations

```bash
# Verify installations
node --version          # Should be v18+
rustc --version         # Should be 1.75+
solana --version        # Should be 1.18+
anchor --version        # Should be 0.29.0
```

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/KaustubhOG/betinco.git
cd betinco
```

### 2. Set Up Environment Variables

Create `.env` files for both frontend and smart contract:

#### Frontend `.env`

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
# Helius RPC (Get free API key from https://www.helius.dev/)
VITE_HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY

# Program ID
VITE_PROGRAM_ID=H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77

# Inco Configuration
VITE_INCO_NETWORK=devnet
```

#### Smart Contract Configuration

```bash
cd ../smartcontract
```

Edit `smartcontract/Anchor.toml`:
```toml
[provider]
cluster = "Devnet"
wallet = "~/.config/solana/id.json"

[programs.devnet]
betinco = "H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77"

[[test.validator.clone]]
address = "Inco1111111111111111111111111111111111111111"  # Inco Lightning Program
```

### 3. Install Dependencies

#### Install Smart Contract Dependencies

```bash
cd smartcontract
npm install
# Rust dependencies will be fetched during build
```

#### Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Build the Smart Contract

```bash
cd ../smartcontract
anchor build
```

This generates the IDL file needed by the frontend.

### 5. Deploy the Smart Contract (Optional)

> **Note**: The program is already deployed to devnet. Only redeploy if you modify the contract.

```bash
# Ensure you have devnet SOL
solana airdrop 2 --url devnet

# Deploy
anchor deploy --provider.cluster devnet
```

### 6. Copy IDL to Frontend

```bash
cp target/idl/betinco.json ../frontend/src/idl/
```

### 7. Run the Frontend

```bash
cd ../frontend
npm run dev
```

The app will start at `http://localhost:5173`

### 8. Wrap SOL to WSOL (Required Before Betting!)

Before you can place any bets, you must wrap your SOL:

**Option A: Using Phantom Wallet**
1. Open Phantom wallet
2. Click on your SOL balance
3. Click "Swap" or "Wrap"
4. Enter amount to wrap → Confirm

**Option B: Using Raydium (Recommended)**
1. Visit [https://raydium.io/swap/](https://raydium.io/swap/)
2. Connect your wallet
3. Select SOL → WSOL
4. Enter amount → Swap

**Option C: Using CLI**
```bash
# Wrap 1 SOL to WSOL
spl-token wrap 1 --url devnet

# Check your WSOL balance
spl-token accounts --url devnet
```

**✅ You're now ready to place bets!**

---

## 🔧 Smart Contract

### Program Structure

The BetInco smart contract consists of these main components:

#### Instructions

```rust
// lib.rs - Main program instructions

#[program]
pub mod betinco {
    
    // Create a new prediction market
    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        market_id: u32,
        question: String,
        settlement_deadline: i64,
    ) -> Result<()>

    // Place a bet with encrypted side
    pub fn place_bet_private(
        ctx: Context<PlaceBetPrivate>,
        market_id: u32,
        amount: u64,
        is_private_mode: bool,
        encrypted_bet_data: Vec<u8>,  // 32 bytes from Inco SDK
    ) -> Result<()>

    // Settle market and declare winner
    pub fn set_winning_side(
        ctx: Context<SetWinner>,
        market_id: u32,
        winner: WinningOutcome,
    ) -> Result<()>

    // V1: Simplified claim (no TEE)
    pub fn claim_simplified(
        ctx: Context<ClaimSimplified>,
        market_id: u32,
    ) -> Result<()>

    // V2: Full TEE-based claim (planned)
    pub fn claim_private(
        ctx: Context<ClaimPrivate>,
        market_id: u32,
        num_handles: u8,
        handle_buffers: Vec<Vec<u8>>,
        plaintext_buffers: Vec<Vec<u8>>,
    ) -> Result<()>
}
```

#### Account Structures

```rust
// state.rs

#[account]
pub struct Market {
    pub authority: Pubkey,              // Market creator
    pub market_id: u32,                 // Unique ID
    pub question: String,               // "Will X happen?"
    pub settlement_deadline: i64,       // Unix timestamp
    pub collateral_mint: Pubkey,        // WSOL mint
    pub collateral_vault: Pubkey,       // Token account
    pub is_settled: bool,               // Settlement status
    pub winning_outcome: Option<WinningOutcome>,
    pub bump: u8,
}

#[account]
pub struct BetData {
    pub encrypted_side: Euint128,       // 🔒 FHE handle (16 bytes)
    pub amount: u64,                    // Public bet amount
    pub is_private_mode: bool,          // Privacy enabled?
    pub claimed: bool,                  // Reward claimed?
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub enum WinningOutcome {
    OutcomeA,  // YES wins
    OutcomeB,  // NO wins
    Neither,   // Draw/Cancel
}
```

#### Building

```bash
cd smartcontract
anchor build
```

#### Testing

```bash
anchor test
```

#### Deploying

```bash
anchor deploy --provider.cluster devnet
```

---

## 🎨 Frontend

### Key Components

#### 1. Inco FHE Encryption (`lib/inco.ts`)

```typescript
import { encryptValue } from '@inco/solana-sdk';
import { PublicKey } from '@solana/web3.js';

export async function encryptBetData(
    amount: number,
    side: number,  // 0 = YES, 1 = NO
    userPubkey: PublicKey
): Promise<{ encryptedAmount: Buffer; encryptedSide: Buffer }> {
    
    // Encrypt both values (V1 only uses side)
    const encryptedAmount = await encryptValue(amount, userPubkey, 'euint128');
    const encryptedSide = await encryptValue(side, userPubkey, 'euint128');
    
    return {
        encryptedAmount: Buffer.from(encryptedAmount),
        encryptedSide: Buffer.from(encryptedSide),
    };
}
```

#### 2. Bet Placement Component

```typescript
// PlaceBet.tsx
import { encryptBetData } from '@/lib/inco';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

const PlaceBet = ({ marketId }: { marketId: number }) => {
    const wallet = useAnchorWallet();
    const [betSide, setBetSide] = useState<'YES' | 'NO'>('YES');
    const [amount, setAmount] = useState(0);

    const handlePlaceBet = async () => {
        if (!wallet) return;

        // 1. Encrypt bet side
        const side = betSide === 'YES' ? 0 : 1;
        const { encryptedSide } = await encryptBetData(0, side, wallet.publicKey);

        // 2. Prepare encrypted data (32 bytes)
        const encryptedData = Buffer.concat([
            Buffer.alloc(16),  // Unused in V1
            encryptedSide,     // Encrypted side (16 bytes)
        ]);

        // 3. Call smart contract
        await program.methods
            .placeBetPrivate(marketId, amount, true, Array.from(encryptedData))
            .accounts({ /* ... */ })
            .rpc();
    };

    return (
        <div>
            <button onClick={() => setBetSide('YES')}>YES</button>
            <button onClick={() => setBetSide('NO')}>NO</button>
            <input type="number" value={amount} onChange={e => setAmount(+e.target.value)} />
            <button onClick={handlePlaceBet}>Place Bet</button>
        </div>
    );
};
```

#### 3. Claim Rewards (V1 Simplified)

```typescript
// ClaimRewards.tsx
const ClaimRewards = ({ marketId }: { marketId: number }) => {
    const wallet = useAnchorWallet();

    const handleClaim = async () => {
        if (!wallet) return;

        // V1: Simplified claim (no TEE decryption)
        await program.methods
            .claimSimplified(marketId)
            .accounts({ /* ... */ })
            .rpc();
    };

    return <button onClick={handleClaim}>Claim Rewards</button>;
};
```

### Running the Frontend

```bash
cd frontend
npm run dev
```

Access at `http://localhost:5173`

---

## 🔄 How It Works

### Complete User Flow

#### 1. **Market Creation** (Admin Only)

```
Admin → Initialize Market
   ↓
Market Account Created
   - Question: "Will Bitcoin reach $100k by EOY?"
   - Deadline: Dec 31, 2026
   - Vault: Created to hold bets
   - Status: Open for betting
```

#### 2. **Placing a Bet** (User)

```
⚠️ PREREQUISITE: Convert SOL to WSOL first!
   User wraps SOL → WSOL via Raydium/Phantom
   ↓
User selects: YES or NO
   ↓
Frontend encrypts choice with Inco SDK
   encryptValue(0 or 1, publicKey) → Buffer(32 bytes)
   ↓
Transaction sent to smart contract
   place_bet_private(marketId, amount, encrypted_data)
   ↓
Smart Contract:
   1. Extracts encrypted side (bytes 16-31)
   2. CPI to Inco Lightning → new_euint128()
   3. Stores Euint128 handle in BetData account
   4. Transfers WSOL amount from user to vault
   ↓
Bet stored on-chain:
   ✅ encrypted_side: Euint128(0x1A2B3C...)  [🔒 PRIVATE]
   ✅ amount: 1000000000 (1 WSOL)           [📢 PUBLIC]
   ✅ claimed: false
```

#### 3. **Market Settlement** (Admin)

```
Deadline passes
   ↓
Admin declares winner
   set_winning_side(marketId, OutcomeA)  // YES wins
   ↓
Market settled:
   - is_settled: true
   - winning_outcome: OutcomeA
```

#### 4. **Claiming Rewards** (Winner)

**V1 (Current - Simplified)**:
```
User clicks "Claim Rewards"
   ↓
Smart Contract:
   1. Checks market is settled ✅
   2. Checks bet not already claimed ✅
   3. [V1: Skip TEE verification]
   4. Calculate payout
   5. Transfer tokens to user
   ↓
Rewards claimed ✅
```

**V2 (Planned - TEE-Based)**:
```
User clicks "Claim Rewards"
   ↓
Frontend:
   1. Fetches encrypted_side handle from on-chain
   2. Calls Inco TEE: decrypt(handle)
   3. TEE decrypts & returns:
      - plaintext: 0 (YES) or 1 (NO)
      - ed25519Instruction: cryptographic signature
   ↓
Build transaction:
   1. Add Ed25519 verification instruction
   2. Add claim_private instruction with plaintext
   ↓
Smart Contract:
   1. Verify Ed25519 signature ✅
   2. Validate plaintext matches handle ✅
   3. Check if plaintext matches winning side ✅
   4. Calculate payout based on pool distribution
   5. Transfer rewards 💰
   ↓
Rewards claimed with cryptographic proof ✅
```

---

## 🔒 Security Model

### V1 Security Features

| Component | Security Measure |
|-----------|------------------|
| **Bet Storage** | Encrypted side stored as FHE handle (not plaintext) |
| **On-Chain Data** | Handle is opaque - no one can derive bet choice |
| **Vault Security** | Token transfers use SPL token program (battle-tested) |
| **PDA Authorization** | Only correct user can interact with their bet account |
| **Settlement Control** | Only authorized admin can declare winner |

### V1 Limitations

⚠️ **V1 does NOT provide**:
- TEE-based decryption (planned V2)
- Ed25519 cryptographic proof (planned V2)
- Encrypted bet amounts (planned V2)
- Zero-knowledge reward claims (planned V2)

### V2 Security Enhancements (Planned)

```
┌─────────────────────────────────────────────────────────┐
│               V2 Security Architecture                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Layer 1: FHE Encryption                                │
│  ✅ Both amount AND side encrypted                      │
│  ✅ Euint128 handles stored on-chain                    │
│                                                          │
│  Layer 2: TEE Isolation                                 │
│  ✅ Decryption in Trusted Execution Environment         │
│  ✅ Memory encrypted, CPU-level protection              │
│  ✅ Remote attestation for verification                 │
│                                                          │
│  Layer 3: Cryptographic Proofs                          │
│  ✅ Ed25519 signatures prove correct decryption         │
│  ✅ On-chain verification without trust                 │
│  ✅ Replay attack prevention                            │
│                                                          │
│  Layer 4: Smart Contract Logic                          │
│  ✅ Handle verification (user owns bet)                 │
│  ✅ Plaintext validation (0 or 1)                       │
│  ✅ Winning side comparison                             │
│  ✅ Single-claim enforcement                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Attack Vectors & Mitigations

| Attack | V1 Mitigation | V2 Enhancement |
|--------|---------------|----------------|
| **Bet Visibility** | Encrypted handles | + TEE decryption |
| **Front-Running** | Opaque on-chain data | + Full encryption |
| **False Claims** | PDA authorization | + Ed25519 proofs |
| **Market Manipulation** | External settlement | Same |
| **Replay Attacks** | Single-claim flag | + Signature nonce |

---

## 👨‍💻 Development

### Local Development Setup

#### 1. Start Local Validator (Optional)

```bash
# Start Solana test validator with Inco program
solana-test-validator \
  --clone Inco1111111111111111111111111111111111111111 \
  --url devnet \
  --reset
```

#### 2. Watch Smart Contract Changes

```bash
cd smartcontract
anchor watch
```

#### 3. Run Frontend in Dev Mode

```bash
cd frontend
npm run dev
```

### Code Formatting

```bash
# Rust (smart contract)
cd smartcontract
cargo fmt

# TypeScript (frontend)
cd frontend
npm run format
```

### Linting

```bash
# Rust
cd smartcontract
cargo clippy

# TypeScript
cd frontend
npm run lint
```

---

## 🧪 Testing

### Smart Contract Tests

```bash
cd smartcontract

# Run all tests
anchor test

# Run specific test
anchor test --skip-local-validator -- --test test_name

# Test with logs
anchor test -- --nocapture
```

### Frontend Tests

```bash
cd frontend

# Unit tests
npm test

# E2E tests (requires running app)
npm run test:e2e
```

### Manual Testing Checklist

- [ ] Connect Phantom wallet
- [ ] Get devnet SOL from faucet
- [ ] **⚠️ CRITICAL: Wrap SOL to WSOL** (use Raydium or Phantom)
- [ ] Create a test market
- [ ] Place bet on YES
- [ ] Place bet on NO (different account)
- [ ] Settle market
- [ ] Claim rewards (winner)
- [ ] Verify loser cannot claim

---

## 🚀 Deployment

### Smart Contract Deployment

```bash
cd smartcontract

# Build optimized
anchor build --verifiable

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show <PROGRAM_ID> --url devnet
```

### Frontend Deployment

#### Vercel (Recommended)

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Manual Build

```bash
npm run build

# Output in dist/ directory
# Upload to any static hosting (Netlify, AWS S3, etc.)
```

### Environment Variables for Production

```env
# Frontend .env.production
VITE_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_MAINNET_KEY
VITE_PROGRAM_ID=<YOUR_MAINNET_PROGRAM_ID>
VITE_INCO_NETWORK=mainnet
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Transaction Failed: Invalid Account" or "Insufficient Funds"

**Most Common Cause**: You're trying to bet with SOL instead of WSOL!

```bash
# Solution: Wrap your SOL to WSOL

# Option 1: Use Phantom Wallet
# Go to your wallet → Select SOL → Click "Swap" → Swap SOL to WSOL

# Option 2: Use Raydium
# Visit https://raydium.io/swap/ → Swap SOL to WSOL

# Option 3: Use CLI
spl-token wrap 1 --url devnet  # Wraps 1 SOL to WSOL

# Verify you have WSOL
spl-token accounts --url devnet
# Look for: Token: So11111111111111111111111111111111111111112
```

#### 2. "Inco SDK not found"

```bash
# Install Inco SDK
cd frontend
npm install @inco/solana-sdk
```

#### 3. "Invalid Program ID"

Ensure `Anchor.toml` and frontend `.env` have the same program ID:

```bash
# Get deployed program ID
solana program show <PUBKEY> --url devnet
```

#### 4. "Insufficient Funds"

```bash
# Airdrop devnet SOL
solana airdrop 2 --url devnet

# Check balance
solana balance --url devnet

# ⚠️ Remember: You still need to wrap SOL to WSOL for betting!
```

#### 5. "Transaction Simulation Failed"

- Check Helius RPC is configured correctly
- Verify wallet has enough SOL for transaction fees
- **Ensure you're using WSOL, not SOL** (most common issue)
- Ensure market is not already settled (for betting)
- Check bet is not already claimed (for claiming)

#### 6. "Anchor Build Fails"

```bash
# Clean build artifacts
cd smartcontract
cargo clean
rm -rf target/

# Rebuild
anchor build
```

#### 7. "Frontend Can't Find IDL"

```bash
# Rebuild contract first
cd smartcontract
anchor build

# Copy IDL to frontend
cp target/idl/betinco.json ../frontend/src/idl/
```

### Debug Mode

Enable verbose logging:

```typescript
// frontend/src/lib/solana.ts
import { Connection } from '@solana/web3.js';

const connection = new Connection(
    import.meta.env.VITE_HELIUS_RPC_URL,
    {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000,
        // Add debug logging
        wsEndpoint: import.meta.env.VITE_HELIUS_WS_URL,
        httpHeaders: { 'Content-Type': 'application/json' },
    }
);

// Log all RPC calls
connection.on('logs', (logs) => console.log('RPC Logs:', logs));
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/betinco.git
cd betinco
```

### 2. Create Feature Branch

```bash
git checkout -b feature/amazing-feature
```

### 3. Make Changes

- Write code
- Add tests
- Update documentation

### 4. Commit

```bash
git add .
git commit -m "feat: add amazing feature"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/)

### 5. Push & PR

```bash
git push origin feature/amazing-feature
```

Open a Pull Request on GitHub

### Development Guidelines

- **Code Style**: Follow Rust and TypeScript best practices
- **Testing**: Add tests for new features
- **Documentation**: Update README for user-facing changes
- **Security**: Never commit private keys or API keys

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 BetInco Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🔗 Links

- **GitHub**: [https://github.com/KaustubhOG/betinco](https://github.com/KaustubhOG/betinco)
- **Inco Network**: [https://inco.org](https://inco.org)
- **Inco Docs**: [https://docs.inco.org](https://docs.inco.org)
- **Solana Docs**: [https://docs.solana.com](https://docs.solana.com)
- **Anchor Docs**: [https://www.anchor-lang.com](https://www.anchor-lang.com)
- **Helius**: [https://www.helius.dev](https://www.helius.dev)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/KaustubhOG/betinco/issues)
- **Discussions**: [GitHub Discussions](https://github.com/KaustubhOG/betinco/discussions)
- **Email**: support@betinco.xyz

---

## 🙏 Acknowledgments

- **Inco Network** for FHE infrastructure
- **Solana Foundation** for the blockchain platform
- **Anchor** for the development framework
- **Helius** for reliable RPC services
- **Community** for feedback and support

---

## 🗺️ Roadmap

### ✅ V1 (Current) - MVP
- [x] Basic prediction markets
- [x] Encrypted bet side storage
- [x] Simple reward claims
- [x] Frontend interface
- [x] Helius RPC integration

### 🚧 V2 (Q2 2026) - Full Privacy
- [ ] TEE-based claim verification
- [ ] Ed25519 signature proofs
- [ ] Encrypted bet amounts
- [ ] Mainnet deployment
- [ ] Mobile app

### 🔮 V3 (Future) - Advanced Features
- [ ] Multiple outcome markets (beyond binary)
- [ ] Liquidity pools for instant exit
- [ ] Oracle integration for automatic settlement
- [ ] Cross-chain predictions
- [ ] DAO governance

---

<div align="center">

**Built with ❤️ by the BetInco Team**

*Empowering Privacy in Decentralized Predictions*

[![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2?style=for-the-badge&logo=twitter)](https://twitter.com/betinco)
[![Discord](https://img.shields.io/badge/Discord-Join-5865F2?style=for-the-badge&logo=discord)](https://discord.gg/betinco)

</div>

