use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq, InitSpace)]
pub enum WinningOutcome {
    OutcomeA,
    OutcomeB,
    Neither, // both sides get 50% payout (optional, for draw scenarios)
}

#[account]
#[derive(InitSpace)]
pub struct Market {
    pub authority: Pubkey,
    pub market_id: u32,
    pub settlement_deadline: i64,
    pub collateral_mint: Pubkey,
    pub collateral_vault: Pubkey,
    pub is_settled: bool,
    pub winning_outcome: Option<WinningOutcome>,
    pub bump: u8,
}
