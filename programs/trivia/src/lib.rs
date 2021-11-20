use anchor_lang::prelude::{borsh::BorshSerialize, *};
use anchor_lang::solana_program::hash::{extend_and_hash, hash, Hash};

use crate::auth::auth;
use crate::data::{Game, Question, RevealedQuestion, Trivia};
use crate::error::ErrorCode;

mod auth;
mod data;
mod error;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
mod trivia {
    use super::*;

    #[derive(Accounts)]
    pub struct InitializeTrivia<'info> {
        #[account(init, payer = authority, space = 9999)]
        trivia: Account<'info, Trivia>,
        #[account(mut)]
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    pub fn initialize(ctx: Context<InitializeTrivia>) -> ProgramResult {
        let trivia = &mut ctx.accounts.trivia;

        trivia.authority = ctx.accounts.authority.key();

        Ok(())
    }

    #[derive(Accounts)]
    pub struct InitializeGame<'info> {
        #[account(mut, has_one = authority)]
        trivia: Account<'info, Trivia>,
        #[account(init, payer = authority, space = 9999)]
        game: Account<'info, Game>,
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    #[access_control(auth(&ctx.accounts.trivia.authority, &ctx.accounts.authority.key))]
    pub fn initialize_game(
        ctx: Context<InitializeGame>,
        name: String,
        questions: Vec<Question>,
    ) -> ProgramResult {
        require!(!name.is_empty(), ErrorCode::InvalidGameName);

        let game = &mut ctx.accounts.game;
        game.trivia = ctx.accounts.trivia.to_account_info().key();
        game.name = name;
        game.questions = questions;
        game.authority = ctx.accounts.authority.key();

        Ok(())
    }

    #[derive(Accounts)]
    pub struct StartGame<'info> {
        #[account(mut, has_one = authority)]
        game: Account<'info, Game>,
        authority: Signer<'info>,
    }

    pub fn start_game(ctx: Context<StartGame>) -> ProgramResult {
        require!(!ctx.accounts.game.started, ErrorCode::GameAlreadyStarted);

        ctx.accounts.game.started = true;

        Ok(())
    }

    #[derive(Accounts)]
    pub struct RevealQuestion<'info> {
        #[account(mut, has_one = authority)]
        game: Account<'info, Game>,
        authority: Signer<'info>,
    }

    #[access_control(auth(&ctx.accounts.game.authority, &ctx.accounts.authority.key))]
    pub fn reveal_question(
        ctx: Context<RevealQuestion>,
        question_id: u32,
        revealed_question: String,
        revealed_variants: Vec<String>,
    ) -> ProgramResult {
        let game = &mut ctx.accounts.game;

        require!(game.started, ErrorCode::GameNotStarted);
        require!(
            question_id as usize == game.revealed_questions.len(),
            ErrorCode::QuestionRevealedAhead
        );

        let question = game
            .questions
            .get(question_id as usize)
            .ok_or(ErrorCode::QuestionDoesNotExist)?;

        let revealed_question_hash = hash(revealed_question.as_ref());

        require!(
            revealed_question_hash == Hash(question.question),
            ErrorCode::InvalidQuestionHash
        );
        require!(
            revealed_variants.len() == question.variants.len(),
            ErrorCode::InvalidQuestionVariantHash
        );

        for (revealed_variant, variant) in revealed_variants
            .iter()
            .zip(question.variants.iter().map(|variant| Hash(*variant)))
        {
            require!(
                extend_and_hash(&revealed_question_hash, revealed_variant.as_bytes()) == variant,
                ErrorCode::InvalidQuestionVariantHash
            );
        }

        game.revealed_questions.push(RevealedQuestion {
            question: revealed_question,
            variants: revealed_variants,
        });

        Ok(())
    }
}
