use anchor_lang::prelude::*;

declare_id!("2ZZGJxn8H7uoyJ1WmWbUkc5wqEEBpXuDM3TvXC8rCH7Q");

#[program]
pub mod betinco {
    use super::*;

    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        market_id: u32,
        settlement_deadline: i64,
    ) -> Result<()> {
        instructions::initialize_market::handle(ctx, market_id, settlement_deadline)
    }

    pub fn place_bet_private(
        ctx: Context<PlaceBetPrivate>,
        market_id: u32,
        amount: u64,
        side: state::WinningOutcome,
        encrypted_bet_data: Vec<u8>, // Encrypted data from Inco client
    ) -> Result<()> {
        instructions::place_bet_private::handle(ctx, market_id, amount, side, encrypted_bet_data)
    }

    pub fn set_winning_side(
        ctx: Context<SetWinner>,
        market_id: u32,
        winner: state::WinningOutcome,
    ) -> Result<()> {
        instructions::set_winning_side::handle(ctx, market_id, winner)
    }

    pub fn claim_private(
        ctx: Context<ClaimPrivate>,
        market_id: u32,
        inco_proof: Vec<u8>, // Proof from Inco that user is eligible
    ) -> Result<()> {
        instructions::claim_private::handle(ctx, market_id, inco_proof)
    }
}
