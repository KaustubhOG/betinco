// Fix src/lib.rs - change instruction:: to instructions::

use anchor_lang::prelude::*;

pub mod error;
pub mod state;
pub mod instructions;

use instructions::*;

declare_id!("2ZZGJxn8H7uoyJ1WmWbUkc5wqEEBpXuDM3TvXC8rCH7Q");

#[program]
pub mod betinco {
    use super::*;

    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        market_id: u32,
        settlement_deadline: i64,
    ) -> Result<()> {
        initialize_market::handle(ctx, market_id, settlement_deadline)
    }

    pub fn place_bet_private(
        ctx: Context<PlaceBetPrivate>,
        market_id: u32,
        amount: u64,
        side: state::WinningOutcome,
        encrypted_bet_data: Vec<u8>,
    ) -> Result<()> {
        place_bet_private::handle(ctx, market_id, amount, side, encrypted_bet_data)
    }

    pub fn set_winning_side(
        ctx: Context<SetWinner>,
        market_id: u32,
        winner: state::WinningOutcome,
    ) -> Result<()> {
        set_winning_side::handle(ctx, market_id, winner)
    }

    pub fn claim_private(
        ctx: Context<ClaimPrivate>,
        market_id: u32,
        inco_proof: Vec<u8>,
    ) -> Result<()> {
        claim_private::handle(ctx, market_id, inco_proof)
    }
}