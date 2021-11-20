use anchor_lang::prelude::{borsh::BorshSerialize, *};
use anchor_lang::solana_program::hash::{extend_and_hash, hash, Hash};

use crate::auth::auth;
use crate::data::{Answer, Game, Question, Trivia};
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
    pub struct CreateGame<'info> {
        #[account(mut, has_one = authority)]
        trivia: Account<'info, Trivia>,
        #[account(init, payer = authority, space = 9999)]
        game: Account<'info, Game>,
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    #[access_control(auth(&ctx.accounts.trivia.authority, &ctx.accounts.authority.key))]
    pub fn create_game(ctx: Context<CreateGame>, name: String) -> ProgramResult {
        require!(!name.is_empty(), ErrorCode::InvalidGameName);

        let game = &mut ctx.accounts.game;
        game.trivia = ctx.accounts.trivia.key();
        game.name = name;
        game.authority = ctx.accounts.authority.key();

        Ok(())
    }

    #[derive(Accounts)]
    pub struct AddQuestion<'info> {
        #[account(mut, has_one = authority)]
        game: Account<'info, Game>,
        #[account(init, payer = authority, space = 9999)]
        question: Account<'info, Question>,
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    #[access_control(auth(&ctx.accounts.game.authority, &ctx.accounts.authority.key))]
    pub fn add_question(
        ctx: Context<AddQuestion>,
        name: [u8; 32],
        variants: Vec<[u8; 32]>,
    ) -> ProgramResult {
        let question = &mut ctx.accounts.question;
        question.game = ctx.accounts.game.key();
        question.question = name;
        question.variants = variants;
        question.authority = ctx.accounts.authority.key();

        ctx.accounts.game.questions.push(question.key());

        Ok(())
    }

    #[derive(Accounts)]
    pub struct StartGame<'info> {
        #[account(mut, has_one = authority)]
        game: Account<'info, Game>,
        authority: Signer<'info>,
    }

    #[access_control(auth(&ctx.accounts.game.authority, &ctx.accounts.authority.key))]
    pub fn start_game(ctx: Context<StartGame>) -> ProgramResult {
        let game = &mut ctx.accounts.game;
        require!(!game.started, ErrorCode::GameAlreadyStarted);

        game.started = true;

        Ok(())
    }

    #[derive(Accounts)]
    pub struct RevealQuestion<'info> {
        #[account(mut, has_one = authority)]
        question: Account<'info, Question>,
        #[account(mut, constraint = question.game == game.key())]
        game: Account<'info, Game>,
        authority: Signer<'info>,
    }

    #[access_control(auth(&ctx.accounts.question.authority, &ctx.accounts.authority.key))]
    pub fn reveal_question(
        ctx: Context<RevealQuestion>,
        revealed_name: String,
        revealed_variants: Vec<String>,
    ) -> ProgramResult {
        let game = &mut ctx.accounts.game;
        require!(game.started, ErrorCode::GameNotStarted);

        let question = &mut ctx.accounts.question;

        let question_id = game
            .questions
            .iter()
            .position(|q| q == &question.key())
            .ok_or(ErrorCode::QuestionDoesNotExist)?;
        require!(
            question_id as u32 == game.revealed_questions_counter,
            ErrorCode::QuestionRevealedAhead
        );

        let revealed_question_hash = hash(revealed_name.as_ref());

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

        question.revealed_question = Some(revealed_name);
        question.revealed_variants = Some(revealed_variants);
        game.revealed_questions_counter += 1;

        Ok(())
    }

    #[derive(Accounts)]
    pub struct SubmitAnswer<'info> {
        #[account(mut)]
        question: Account<'info, Question>,
        #[account(mut, constraint = question.game == game.key())]
        game: Account<'info, Game>,
        #[account(init, payer = user, space = 9999)]
        answer: Account<'info, Answer>,
        user: Signer<'info>,
        system_program: Program<'info, System>,
    }

    pub fn submit_answer(ctx: Context<SubmitAnswer>, variant_id: u32) -> ProgramResult {
        let game = &ctx.accounts.game;
        require!(game.started, ErrorCode::GameNotStarted);

        let question = &mut ctx.accounts.question;

        question
            .variants
            .get(variant_id as usize)
            .ok_or(ErrorCode::VariantDoesNotExist)?;

        let answer = &mut ctx.accounts.answer;
        answer.question = question.key();
        answer.variant_id = variant_id;
        answer.user = ctx.accounts.user.key();

        question.votes.push(answer.key());

        Ok(())
    }
}
