use anchor_lang::prelude::*;

#[error_code]
pub enum PredictionMarketError {
    #[msg("Market has already been settled")]
    MarketAlreadySettled,

    #[msg("Market has not been settled yet")]
    MarketNotSettled,

    #[msg("Market deadline has passed")]
    MarketExpired,

    #[msg("Settlement deadline must be in the future")]
    InvalidSettlementDeadline,

    #[msg("Settlement can only occur after deadline")]
    SettlementTooEarly,

    #[msg("Amount must be greater than zero")]
    InvalidAmount,

    #[msg("Invalid winning outcome specified")]
    InvalidWinningOutcome,

    #[msg("Winning outcome has not been set")]
    WinningOutcomeNotSet,

    #[msg("Math operation overflow")]
    MathOverflow,

    #[msg("Insufficient balance in vault")]
    InsufficientVaultBalance,

    #[msg("Invalid proof from Inco")]
    InvalidProof,

    #[msg("User has already claimed rewards")]
    AlreadyClaimed,

    #[msg("User is not eligible for rewards")]
    NotEligible,
}
