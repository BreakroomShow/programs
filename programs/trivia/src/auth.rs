use anchor_lang::prelude::*;

use crate::data::Trivia;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct Auth<'info> {
    #[account(signer)]
    authority: AccountInfo<'info>,
}

pub fn auth(trivia: &Trivia, authority: &Pubkey) -> ProgramResult {
    require!(&trivia.authority == authority, ErrorCode::Unauthorized);
    Ok(())
}
