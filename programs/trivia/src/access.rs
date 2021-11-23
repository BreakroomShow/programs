use anchor_lang::prelude::*;

use crate::error::ErrorCode;
use crate::{Player, Trivia};

pub fn admin(protected_authority: &Pubkey, signer: &Signer) -> ProgramResult {
    require!(protected_authority == signer.key, ErrorCode::Unauthorized);
    Ok(())
}

pub fn player(
    trivia: &Account<Trivia>,
    player: &Account<Player>,
    signer: &Signer,
) -> ProgramResult {
    require!(
        player.trivia == trivia.key() && player.authority == signer.key(),
        ErrorCode::Unauthorized
    );
    Ok(())
}
