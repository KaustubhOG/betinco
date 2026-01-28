use crate::error::PredictionMarketError;
use crate::instructions::place_bet_private::BetData;
use crate::state::{Market, WinningOutcome};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use inco_lightning::cpi::accounts::Operation;
use inco_lightning::cpi::{e_eq, new_euint128};
use inco_lightning::types::Ebool;
use inco_lightning::ID as INCO_LIGHTNING_ID;

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
}

pub fn handle(ctx: Context<ClaimPrivate>, _market_id: u32, inco_proof: Vec<u8>) -> Result<()> {
    let market = &ctx.accounts.market;
    let bet_account = &mut ctx.accounts.bet_account;

    require!(market.is_settled, PredictionMarketError::MarketNotSettled);

    let winning_outcome = market
        .winning_outcome
        .ok_or(PredictionMarketError::WinningOutcomeNotSet)?;

    require!(!bet_account.claimed, PredictionMarketError::AlreadyClaimed);

    let winning_side_value = match winning_outcome {
        WinningOutcome::OutcomeA => 0u128,
        WinningOutcome::OutcomeB => 1u128,
        WinningOutcome::Neither => {
            // For draw, user should get their bet back
            // In a real implementation, you'd decrypt the amount using inco_proof
            // For now, we'll skip the payout logic for Neither case
            bet_account.claimed = true;

            emit!(RewardClaimedEvent {
                market_id: market.market_id,
                user: ctx.accounts.user.key(),
                timestamp: Clock::get()?.unix_timestamp,
            });

            return Ok(());
        }
    };

    let side_bytes = winning_side_value.to_le_bytes().to_vec();
    let encrypted_winning_side = new_euint128(
        CpiContext::new(
            ctx.accounts.inco_lightning_program.to_account_info(),
            Operation {
                signer: ctx.accounts.user.to_account_info(),
            },
        ),
        side_bytes,
        0,
    )?;

    let _is_winner: Ebool = e_eq(
        CpiContext::new(
            ctx.accounts.inco_lightning_program.to_account_info(),
            Operation {
                signer: ctx.accounts.user.to_account_info(),
            },
        ),
        bet_account.encrypted_side,
        encrypted_winning_side,
        0,
    )?;

    // In production: Use inco_proof to verify winner and decrypt amount
    // For MVP: Assume user provided valid proof, parse amount from proof
    // This is a simplified implementation - you need proper proof verification
    
    let payout_amount = if inco_proof.len() >= 8 {
        u64::from_le_bytes(inco_proof[0..8].try_into().unwrap_or([0u8; 8]))
    } else {
        return Err(PredictionMarketError::InvalidProof.into());
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

    emit!(RewardClaimedEvent {
        market_id: market.market_id,
        user: ctx.accounts.user.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("Rewards claimed for market {}", market.market_id);
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
    pub timestamp: i64,
}