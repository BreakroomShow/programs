use anchor_lang::prelude::*;

use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct Auth<'info> {
    #[account(signer)]
    authority: AccountInfo<'info>,
}

pub fn auth(protected_authority: &Pubkey, user_authority: &Pubkey) -> ProgramResult {
    require!(
        protected_authority == user_authority,
        ErrorCode::Unauthorized
    );
    Ok(())
}
