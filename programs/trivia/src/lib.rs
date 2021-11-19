use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::{hash, Hash};

use crate::auth::auth;
use crate::borsh::BorshSerialize;
use crate::data::{Game, Question, RevealedQuestion, Trivia};
use crate::error::ErrorCode;

mod auth;
mod data;
mod error;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
mod trivia {
    use anchor_lang::solana_program::hash::extend_and_hash;

    use super::*;

    #[derive(Accounts)]
    pub struct InitializeTrivia<'info> {
        #[account(init, payer = authority, space = 9000)]
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
    pub struct CreateGame<'info> {
        #[account(mut, has_one = authority)]
        trivia: Account<'info, Trivia>,
        authority: Signer<'info>,
    }

    #[access_control(auth(&ctx.accounts.trivia, &ctx.accounts.authority.key))]
    pub fn create_game(
        ctx: Context<CreateGame>,
        name: String,
        questions: Vec<Question>,
    ) -> ProgramResult {
        require!(!name.is_empty(), ErrorCode::InvalidGameName);

        for question in &questions {
            require!(
                question.revealed_question.is_none() && question.revealed_variants.is_none(),
                ErrorCode::RevealedQuestionsOnGameCreation
            );
        }

        let id = ctx.accounts.trivia.games.len() as u32;
        ctx.accounts.trivia.games.push(Game {
            id,
            name,
            questions,
            ..Default::default()
        });

        Ok(())
    }

    #[derive(Accounts)]
    pub struct RevealQuestion<'info> {
        #[account(mut, has_one = authority)]
        trivia: Account<'info, Trivia>,
        authority: Signer<'info>,
    }

    #[access_control(auth(&ctx.accounts.trivia, &ctx.accounts.authority.key))]
    pub fn reveal_question(
        ctx: Context<RevealQuestion>,
        game_id: u32,
        question_id: u32,
        revealed_question: String,
        revealed_variants: Vec<String>,
    ) -> ProgramResult {
        let game = ctx
            .accounts
            .trivia
            .games
            .get_mut(game_id as usize)
            .ok_or(ErrorCode::GameDoesNotExist)?;

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
