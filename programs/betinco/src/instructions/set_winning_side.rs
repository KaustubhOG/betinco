use crate::error::PredictionMarketError;
use crate::state::{Market, WinningOutcome};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(market_id: u32)]
pub struct SetWinner<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"market", market.market_id.to_le_bytes().as_ref()],
        bump = market.bump,
        constraint = market.market_id == market_id,
        constraint = market.authority == authority.key()
    )]
    pub market: Account<'info, Market>,
}

pub fn handle(ctx: Context<SetWinner>, _market_id: u32, winner: WinningOutcome) -> Result<()> {
    let market = &mut ctx.accounts.market;

    require!(
        !market.is_settled,
        PredictionMarketError::MarketAlreadySettled
    );

    require!(
        Clock::get()?.unix_timestamp >= market.settlement_deadline,
        PredictionMarketError::SettlementTooEarly
    );

    require!(
        matches!(
            winner,
            WinningOutcome::OutcomeA | WinningOutcome::OutcomeB | WinningOutcome::Neither
        ),
        PredictionMarketError::InvalidWinningOutcome
    );

    market.is_settled = true;
    market.winning_outcome = Some(winner);

    emit!(MarketSettledEvent {
        market_id: market.market_id,
        winner,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("Market settled. Winner: {:?}", winner);
    Ok(())
}

#[event]
pub struct MarketSettledEvent {
    pub market_id: u32,
    pub winner: WinningOutcome,
    pub timestamp: i64,
}
