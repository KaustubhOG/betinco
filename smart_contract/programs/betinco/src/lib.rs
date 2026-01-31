use anchor_lang::prelude::*;

pub mod error;
pub mod state;
pub mod instructions;

use instructions::*;

declare_id!("H5xTV9x61nDR2kLTKXekM4YntaNUpCNEDxZYVmZpre77");

#[program]
pub mod betinco {
    use super::*;

    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        market_id: u32,
        question: String,
        settlement_deadline: i64,
    ) -> Result<()> {
        instructions::initialize_market::handle(ctx, market_id, question, settlement_deadline)
    }

    pub fn place_bet_private<'info>(
        ctx: Context<'_, '_, '_, 'info, PlaceBetPrivate<'info>>,
        market_id: u32,
        amount: u64,
        is_private_mode: bool,
        encrypted_bet_data: Vec<u8>,
    ) -> Result<()> {
        instructions::place_bet_private::handle(ctx, market_id, amount, is_private_mode, encrypted_bet_data)
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
        num_handles: u8,
        handle_buffers: Vec<Vec<u8>>,
        plaintext_buffers: Vec<Vec<u8>>,
    ) -> Result<()> {
        instructions::claim_private::handle(ctx, market_id, num_handles, handle_buffers, plaintext_buffers)
    }
}