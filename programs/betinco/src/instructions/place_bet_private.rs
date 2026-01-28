use crate::error::PredictionMarketError;
use crate::state::{Market, WinningOutcome};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use inco_lightning::cpi::accounts::Operation;
use inco_lightning::cpi::new_euint128;
use inco_lightning::types::Euint128;
use inco_lightning::ID as INCO_LIGHTNING_ID;

#[derive(Accounts)]
#[instruction(market_id: u32)]
pub struct PlaceBetPrivate<'info> {
    #[account(
        mut,
        seeds = [b"market", market.market_id.to_le_bytes().as_ref()],
        bump = market.bump,
        constraint = market.market_id == market_id
    )]
    pub market: Account<'info, Market>,

    #[account(mut)]
    pub user: Signer<'info>,

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

    pub token_program: Program<'info, Token>,

    /// CHECK: Inco Lightning program for encrypted operations
    #[account(address = INCO_LIGHTNING_ID)]
    pub inco_lightning_program: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 32 + 1 + 1,
        seeds = [b"bet", market.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub bet_account: Account<'info, BetData>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct BetData {
    pub encrypted_amount: Euint128,
    pub encrypted_side: Euint128,
    pub claimed: bool,
    pub bump: u8,
}

pub fn handle(
    ctx: Context<PlaceBetPrivate>,
    _market_id: u32,
    amount: u64,
    side: WinningOutcome,
    encrypted_bet_data: Vec<u8>,
) -> Result<()> {
    let market = &ctx.accounts.market;
    let bet_account = &mut ctx.accounts.bet_account;

    require!(
        !market.is_settled,
        PredictionMarketError::MarketAlreadySettled
    );
    require!(
        Clock::get()?.unix_timestamp < market.settlement_deadline,
        PredictionMarketError::MarketExpired
    );
    require!(amount > 0, PredictionMarketError::InvalidAmount);
    require!(
        matches!(side, WinningOutcome::OutcomeA | WinningOutcome::OutcomeB),
        PredictionMarketError::InvalidWinningOutcome
    );

    require!(!bet_account.claimed, PredictionMarketError::AlreadyClaimed);

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_collateral.to_account_info(),
                to: ctx.accounts.collateral_vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount,
    )?;

    let amount_bytes = (amount as u128).to_le_bytes().to_vec();
    let encrypted_amount = new_euint128(
        CpiContext::new(
            ctx.accounts.inco_lightning_program.to_account_info(),
            Operation {
                signer: ctx.accounts.user.to_account_info(),
            },
        ),
        amount_bytes,
        0,
    )?;

    let side_value = match side {
        WinningOutcome::OutcomeA => 0u128,
        WinningOutcome::OutcomeB => 1u128,
        _ => return Err(PredictionMarketError::InvalidWinningOutcome.into()),
    };

    let side_bytes = side_value.to_le_bytes().to_vec();
    let encrypted_side = new_euint128(
        CpiContext::new(
            ctx.accounts.inco_lightning_program.to_account_info(),
            Operation {
                signer: ctx.accounts.user.to_account_info(),
            },
        ),
        side_bytes,
        0,
    )?;

    bet_account.encrypted_amount = encrypted_amount;
    bet_account.encrypted_side = encrypted_side;
    bet_account.claimed = false;
    bet_account.bump = ctx.bumps.bet_account;

    emit!(BetPlacedEvent {
        market_id: market.market_id,
        user: ctx.accounts.user.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("Private bet placed for market {}", market.market_id);
    Ok(())
}

#[event]
pub struct BetPlacedEvent {
    pub market_id: u32,
    pub user: Pubkey,
    pub timestamp: i64,
}