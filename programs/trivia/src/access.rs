use anchor_lang::prelude::*;

use crate::error::ErrorCode;
use crate::{Trivia, User};

pub fn admin(protected_authority: &Pubkey, signer: &Signer) -> ProgramResult {
    require!(protected_authority == signer.key, ErrorCode::Unauthorized);
    Ok(())
}

pub fn user(trivia: &Account<Trivia>, user: &Account<User>) -> ProgramResult {
    require!(user.trivia == trivia.key(), ErrorCode::Unauthorized);
    Ok(())
}
