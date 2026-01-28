use anchor_lang::prelude::*;

declare_id!("2ZZGJxn8H7uoyJ1WmWbUkc5wqEEBpXuDM3TvXC8rCH7Q");

#[program]
pub mod betinco {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
