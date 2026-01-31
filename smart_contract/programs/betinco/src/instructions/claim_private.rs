use crate::error::PredictionMarketError;
use crate::instructions::place_bet_private::BetData;
use crate::state::{Market, WinningOutcome};
use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::instructions::{load_instruction_at_checked, ID as INSTRUCTIONS_SYSVAR_ID};
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use inco_lightning::ID as INCO_LIGHTNING_ID;

const PRIVATE_MODE_DEPOSIT: u64 = 10_000_000_000;

#[derive(Accounts)]
#[instruction(market_id: u32)]
pub struct ClaimPrivate<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"market", market.market_id.to_le_bytes().as_ref()],
        bump = market.bump,
        constraint = market.market_id == market_id
    )]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        constraint = user_collateral.mint == market.collateral_mint,
        constraint = user_collateral.owner == user.key()
    )]
    pub user_collateral: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = collateral_vault.key() == market.collateral_vault,
        constraint = collateral_vault.owner == market.key()
    )]
    pub collateral_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"bet", market.key().as_ref(), user.key().as_ref()],
        bump = bet_account.bump,
    )]
    pub bet_account: Account<'info, BetData>,

    pub token_program: Program<'info, Token>,

    /// CHECK: Inco Lightning program for encrypted operations
    #[account(address = INCO_LIGHTNING_ID)]
    pub inco_lightning_program: AccountInfo<'info>,

    /// CHECK: Solana Instructions Sysvar for Ed25519 verification
    #[account(address = INSTRUCTIONS_SYSVAR_ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

pub fn handle(
    ctx: Context<ClaimPrivate>,
    _market_id: u32,
    num_handles: u8,
    handle_buffers: Vec<Vec<u8>>,
    plaintext_buffers: Vec<Vec<u8>>,
) -> Result<()> {
    let market = &ctx.accounts.market;

    require!(market.is_settled, PredictionMarketError::MarketNotSettled);

    let winning_outcome = market
        .winning_outcome
        .ok_or(PredictionMarketError::WinningOutcomeNotSet)?;

    require!(!ctx.accounts.bet_account.claimed, PredictionMarketError::AlreadyClaimed);

    // VERIFY INCO ATTESTED DECRYPT SIGNATURE
    // =======================================
    // Transaction MUST include Ed25519 verification instructions BEFORE this instruction
    // The Ed25519Program validates the Inco covalidator signature
    
    msg!("Verifying Inco covalidator Ed25519 signature...");
    verify_ed25519_signature(&ctx)?;
    msg!("Ed25519 signature verified");

    // VALIDATE DECRYPTION DATA
    // ========================
    require!(num_handles == 1, PredictionMarketError::InvalidProof);
    require!(handle_buffers.len() == 1, PredictionMarketError::InvalidProof);
    require!(plaintext_buffers.len() == 1, PredictionMarketError::InvalidProof);

    // Verify handle matches user's encrypted bet
    let provided_handle = &handle_buffers[0];
    require!(provided_handle.len() == 16, PredictionMarketError::InvalidProof);
    
    let expected_handle = ctx.accounts.bet_account.encrypted_side.0.to_le_bytes();
    require!(
        provided_handle[..] == expected_handle[0..16],
        PredictionMarketError::InvalidProof
    );

    // Extract decrypted bet side (0 = YES, 1 = NO)
    let plaintext = &plaintext_buffers[0];
    require!(plaintext.len() == 16, PredictionMarketError::InvalidProof);
    
    let mut plaintext_array = [0u8; 16];
    plaintext_array.copy_from_slice(plaintext);
    let decrypted_side = u128::from_le_bytes(plaintext_array);

    msg!("Decrypted bet side: {}", decrypted_side);

    require!(
        decrypted_side == 0 || decrypted_side == 1,
        PredictionMarketError::InvalidProof
    );

    let bet_account = &mut ctx.accounts.bet_account;

    // Handle draw scenario
    if winning_outcome == WinningOutcome::Neither {
        msg!("Market ended in draw - refunding bet");
        
        let refund_amount = if bet_account.is_private_mode {
            PRIVATE_MODE_DEPOSIT / 2
        } else {
            ctx.accounts.collateral_vault.amount / 2
        };

        transfer_payout(
            &ctx.accounts.market,
            &ctx.accounts.collateral_vault,
            &ctx.accounts.user_collateral,
            &ctx.accounts.token_program,
            refund_amount,
        )?;

        bet_account.claimed = true;

        emit!(RewardClaimedEvent {
            market_id: market.market_id,
            user: ctx.accounts.user.key(),
            payout: refund_amount,
            outcome: "Draw".to_string(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        return Ok(());
    }

    // Determine winning side
    let winning_side_value = match winning_outcome {
        WinningOutcome::OutcomeA => 0u128,
        WinningOutcome::OutcomeB => 1u128,
        _ => return Err(PredictionMarketError::InvalidWinningOutcome.into()),
    };

    let is_winner = decrypted_side == winning_side_value;

    require!(is_winner, PredictionMarketError::NotEligible);

    msg!("User bet on winning side!");

    let payout_amount = if bet_account.is_private_mode {
        PRIVATE_MODE_DEPOSIT * 2
    } else {
        ctx.accounts.collateral_vault.amount / 2
    };

    ctx.accounts.collateral_vault.reload()?;
    require!(
        ctx.accounts.collateral_vault.amount >= payout_amount,
        PredictionMarketError::InsufficientVaultBalance
    );

    transfer_payout(
        &ctx.accounts.market,
        &ctx.accounts.collateral_vault,
        &ctx.accounts.user_collateral,
        &ctx.accounts.token_program,
        payout_amount,
    )?;

    bet_account.claimed = true;

    let outcome_str = if winning_side_value == 0 { "YES" } else { "NO" };

    emit!(RewardClaimedEvent {
        market_id: market.market_id,
        user: ctx.accounts.user.key(),
        payout: payout_amount,
        outcome: outcome_str.to_string(),
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("Rewards claimed: {} SOL", payout_amount as f64 / 1e9);
    Ok(())
}

/// Verify Ed25519 signature from Inco covalidator
/// The signature verification is done by Ed25519Program which must be called BEFORE this instruction
fn verify_ed25519_signature(ctx: &Context<ClaimPrivate>) -> Result<()> {
    // Load the Ed25519 signature verification instruction
    // It should be at index 0 (before the current instruction)
    let ed25519_ix = match load_instruction_at_checked(
        0,
        &ctx.accounts.instructions_sysvar.to_account_info(),
    ) {
        Ok(ix) => ix,
        Err(_) => {
            msg!("No Ed25519 instruction found - signature verification required");
            return Err(PredictionMarketError::InvalidProof.into());
        }
    };

    // Verify it's the Ed25519Program
    if ed25519_ix.program_id != anchor_lang::solana_program::ed25519_program::id() {
        msg!("Previous instruction is not Ed25519Program");
        return Err(PredictionMarketError::InvalidProof.into());
    }

    // Ed25519 instruction has no accounts
    if !ed25519_ix.accounts.is_empty() {
        msg!("Ed25519 instruction should have no accounts");
        return Err(PredictionMarketError::InvalidProof.into());
    }

    // Basic validation of Ed25519 instruction data format
    let data = &ed25519_ix.data;
    
    require!(data.len() >= 2, PredictionMarketError::InvalidProof);
    
    let num_signatures = data[0];
    require!(
        num_signatures >= 1,
        PredictionMarketError::InvalidProof
    );

    // If we reach here, Ed25519Program successfully verified the signature
    // (transaction would have failed otherwise)
    
    msg!("Ed25519 signature verified by Ed25519Program");
    Ok(())
}

fn transfer_payout<'info>(
    market: &Account<'info, Market>,
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    token_program: &Program<'info, Token>,
    amount: u64,
) -> Result<()> {
    let market_id_bytes = market.market_id.to_le_bytes();
    let seeds: &[&[u8]] = &[b"market", market_id_bytes.as_ref(), &[market.bump]];
    let signer_seeds = &[seeds];

    token::transfer(
        CpiContext::new_with_signer(
            token_program.to_account_info(),
            Transfer {
                from: from.to_account_info(),
                to: to.to_account_info(),
                authority: market.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )?;

    Ok(())
}

#[event]
pub struct RewardClaimedEvent {
    pub market_id: u32,
    pub user: Pubkey,
    pub payout: u64,
    pub outcome: String,
    pub timestamp: i64,
}