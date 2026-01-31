use crate::error::PredictionMarketError;
use crate::state::Market;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use inco_lightning::cpi::accounts::{Operation, Allow};
use inco_lightning::cpi::{new_euint128, allow};
use inco_lightning::types::Euint128;
use inco_lightning::ID as INCO_LIGHTNING_ID;

const MAX_PRIVATE_BET: u64 = 10_000_000_000;
const PRIVATE_MODE_DEPOSIT: u64 = 10_000_000_000;

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
        space = 8 + 32 + 32 + 1 + 1 + 1,
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
    pub is_private_mode: bool,
    pub claimed: bool,
    pub bump: u8,
}

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, PlaceBetPrivate<'info>>,
    _market_id: u32,
    amount: u64,
    is_private_mode: bool,
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
    require!(!bet_account.claimed, PredictionMarketError::AlreadyClaimed);

    let transfer_amount: u64 = if is_private_mode {
        require!(
            amount <= MAX_PRIVATE_BET,
            PredictionMarketError::InvalidAmount
        );
        PRIVATE_MODE_DEPOSIT
    } else {
        amount
    };

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_collateral.to_account_info(),
                to: ctx.accounts.collateral_vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        transfer_amount,
    )?;

    require!(
        encrypted_bet_data.len() >= 32,
        PredictionMarketError::InvalidProof
    );

    let encrypted_amount_bytes = encrypted_bet_data[0..16].to_vec();
    let encrypted_side_bytes = encrypted_bet_data[16..32].to_vec();

    let encrypted_amount = new_euint128(
        CpiContext::new(
            ctx.accounts.inco_lightning_program.to_account_info(),
            Operation {
                signer: ctx.accounts.user.to_account_info(),
            },
        ),
        encrypted_amount_bytes,
        0,
    )?;

    let encrypted_side = new_euint128(
        CpiContext::new(
            ctx.accounts.inco_lightning_program.to_account_info(),
            Operation {
                signer: ctx.accounts.user.to_account_info(),
            },
        ),
        encrypted_side_bytes,
        0,
    )?;

    bet_account.encrypted_amount = encrypted_amount;
    bet_account.encrypted_side = encrypted_side;
    bet_account.is_private_mode = is_private_mode;
    bet_account.claimed = false;
    bet_account.bump = ctx.bumps.bet_account;

    if ctx.remaining_accounts.len() >= 1 {
        let allowance_account = &ctx.remaining_accounts[0];
        let allowed_address = &ctx.remaining_accounts[1];
        
        let cpi_ctx = CpiContext::new(
            ctx.accounts.inco_lightning_program.to_account_info(),
            Allow {
                allowance_account: allowance_account.to_account_info(),
                signer: ctx.accounts.user.to_account_info(),
                allowed_address: allowed_address.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
        );
        
        allow(cpi_ctx, encrypted_side.0, true, ctx.accounts.user.key())?;
        msg!("Decrypt permission granted");
    }

    emit!(BetPlacedEvent {
        market_id: market.market_id,
        user: ctx.accounts.user.key(),
        is_private_mode,
        encrypted_side_handle: encrypted_side.0,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("Bet placed for market {}", market.market_id);
    Ok(())
}

#[event]
pub struct BetPlacedEvent {
    pub market_id: u32,
    pub user: Pubkey,
    pub is_private_mode: bool,
    pub encrypted_side_handle: u128,
    pub timestamp: i64,
}