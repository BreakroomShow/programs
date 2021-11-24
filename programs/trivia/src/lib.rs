use anchor_lang::prelude::{borsh::BorshSerialize, *};
use anchor_lang::solana_program::hash::{extend_and_hash, hash, Hash};

use crate::data::{Answer, Game, Player, Question, RevealedQuestion, Trivia};
use crate::error::ErrorCode;
use crate::event::{RevealAnswerEvent, RevealQuestionEvent, StartGameEvent};

mod access;
mod data;
mod error;
mod event;
mod seed;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
mod trivia {
    use super::*;

    #[derive(Accounts)]
    #[instruction(bump: u8)]
    pub struct InitializeTrivia<'info> {
        #[account(
            init,
            payer = authority,
            seeds = [seed::TRIVIA.as_ref()],
            bump = bump
        )]
        trivia: Account<'info, Trivia>,
        #[account(mut)]
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    pub fn initialize(ctx: Context<InitializeTrivia>, bump: u8) -> ProgramResult {
        let trivia = &mut ctx.accounts.trivia;

        trivia.authority = ctx.accounts.authority.key();
        trivia.bump = bump;

        Ok(())
    }

    #[derive(Accounts)]
    #[instruction(player_key: Pubkey, bump: u8)]
    pub struct WhitelistPlayer<'info> {
        #[account(has_one = authority)]
        trivia: Account<'info, Trivia>,
        #[account(
            init,
            payer = authority,
            seeds = [seed::WHITELISTED_PLAYER.as_ref(), trivia.key().as_ref(), player_key.as_ref()],
            bump = bump
        )]
        whitelisted_player: Account<'info, Player>,
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    #[access_control(access::admin(&ctx.accounts.trivia.authority, &ctx.accounts.authority))]
    pub fn whitelist_player(
        ctx: Context<WhitelistPlayer>,
        player_key: Pubkey,
        bump: u8,
    ) -> ProgramResult {
        let player = &mut ctx.accounts.whitelisted_player;

        player.trivia = ctx.accounts.trivia.key();
        player.authority = player_key;
        player.bump = bump;

        Ok(())
    }

    #[derive(Accounts)]
    pub struct AddPlayerInvite<'info> {
        #[account(has_one = authority)]
        trivia: Account<'info, Trivia>,
        #[account(mut, has_one = trivia)]
        player: Account<'info, Player>,
        authority: Signer<'info>,
    }

    #[access_control(access::admin(&ctx.accounts.trivia.authority, &ctx.accounts.authority))]
    pub fn add_player_invite(ctx: Context<AddPlayerInvite>) -> ProgramResult {
        ctx.accounts.player.left_invites_counter += 1;

        Ok(())
    }

    #[derive(Accounts)]
    #[instruction(player_key: Pubkey, bump: u8)]
    pub struct InvitePlayer<'info> {
        #[account()]
        trivia: Account<'info, Trivia>,
        #[account(
            init,
            payer = authority,
            seeds = [
                seed::WHITELISTED_PLAYER.as_ref(),
                trivia.key().as_ref(),
                player_key.as_ref()
            ],
            bump = bump
        )]
        invited_player: Account<'info, Player>,
        #[account(mut, has_one = authority, has_one = trivia)]
        player: Account<'info, Player>,
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    #[access_control(access::player(&ctx.accounts.trivia, &ctx.accounts.player, &ctx.accounts.authority))]
    pub fn invite_player(
        ctx: Context<InvitePlayer>,
        player_key: Pubkey,
        bump: u8,
    ) -> ProgramResult {
        let player = &mut ctx.accounts.player;
        let invited_player = &mut ctx.accounts.invited_player;

        require!(
            player.left_invites_counter > 0,
            ErrorCode::NotEnoughInvitesLeft
        );

        invited_player.trivia = ctx.accounts.trivia.key();
        invited_player.authority = player_key;
        invited_player.bump = bump;

        player.left_invites_counter -= 1;

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

    #[access_control(access::admin(&ctx.accounts.trivia.authority, &ctx.accounts.authority))]
    pub fn create_game(ctx: Context<CreateGame>, name: String) -> ProgramResult {
        let game = &mut ctx.accounts.game;

        require!(!name.is_empty(), ErrorCode::InvalidGameName);

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

    #[access_control(access::admin(&ctx.accounts.game.authority, &ctx.accounts.authority))]
    pub fn add_question(
        ctx: Context<AddQuestion>,
        name: [u8; 32],
        variants: Vec<[u8; 32]>,
        time: i64,
    ) -> ProgramResult {
        let game = &mut ctx.accounts.game;
        let question = &mut ctx.accounts.question;

        require!(!game.started, ErrorCode::GameAlreadyStarted);

        question.game = game.key();
        question.question = name;
        question.variants = variants;
        question.authority = ctx.accounts.authority.key();
        question.time = time;

        game.questions.push(question.key());

        Ok(())
    }

    #[derive(Accounts)]
    pub struct EditQuestion<'info> {
        #[account(mut, has_one = authority)]
        game: Account<'info, Game>,
        authority: Signer<'info>,
    }

    #[access_control(access::admin(&ctx.accounts.game.authority, &ctx.accounts.authority))]
    pub fn remove_question(ctx: Context<EditQuestion>, question_key: Pubkey) -> ProgramResult {
        remove_question_from_game(&mut ctx.accounts.game, question_key)?;

        Ok(())
    }

    #[access_control(access::admin(&ctx.accounts.game.authority, &ctx.accounts.authority))]
    pub fn move_question(
        ctx: Context<EditQuestion>,
        question_key: Pubkey,
        new_position: u32,
    ) -> ProgramResult {
        remove_question_from_game(&mut ctx.accounts.game, question_key)?;

        ctx.accounts
            .game
            .questions
            .insert(new_position as usize, question_key);

        Ok(())
    }

    #[derive(Accounts)]
    pub struct StartGame<'info> {
        #[account(mut, has_one = authority)]
        game: Account<'info, Game>,
        authority: Signer<'info>,
    }

    #[access_control(access::admin(&ctx.accounts.game.authority, &ctx.accounts.authority))]
    pub fn start_game(ctx: Context<StartGame>) -> ProgramResult {
        let game = &mut ctx.accounts.game;

        require!(!game.started, ErrorCode::GameAlreadyStarted);

        game.started = true;

        emit!(StartGameEvent { game: game.key() });

        Ok(())
    }

    #[derive(Accounts)]
    pub struct RevealQuestion<'info> {
        #[account(mut, constraint = question.game == game.key())]
        game: Account<'info, Game>,
        #[account(mut, has_one = authority)]
        question: Account<'info, Question>,
        authority: Signer<'info>,
    }

    #[access_control(access::admin(&ctx.accounts.question.authority, &ctx.accounts.authority))]
    pub fn reveal_question(
        ctx: Context<RevealQuestion>,
        revealed_name: String,
        revealed_variants: Vec<String>,
    ) -> ProgramResult {
        let game = &mut ctx.accounts.game;
        let question = &mut ctx.accounts.question;

        require!(game.started, ErrorCode::GameNotStarted);

        let question_id = game
            .questions
            .iter()
            .position(|&q| q == question.key())
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
            .zip(question.variants.iter().map(|&variant| Hash(variant)))
        {
            require!(
                extend_and_hash(&revealed_question_hash, revealed_variant.as_bytes()) == variant,
                ErrorCode::InvalidQuestionVariantHash
            );
        }

        question.revealed_question = Some(RevealedQuestion {
            question: revealed_name,
            variants: revealed_variants,
            deadline: Clock::get()?.unix_timestamp + question.time,
            answers: vec![vec![]; question.variants.len()],
            ..Default::default()
        });

        game.revealed_questions_counter += 1;

        emit!(RevealQuestionEvent {
            game: game.key(),
            question: question.key()
        });

        Ok(())
    }

    #[derive(Accounts)]
    #[instruction(variant_id: u32, bump: u8)]
    pub struct SubmitAnswer<'info> {
        #[account()]
        trivia: Account<'info, Trivia>,
        #[account(constraint = question.game == game.key(), has_one = trivia)]
        game: Account<'info, Game>,
        #[account(mut)]
        question: Account<'info, Question>,
        #[account(
            init,
            payer = authority,
            seeds = [
                seed::ANSWER.as_ref(),
                trivia.key().as_ref(),
                game.key().as_ref(),
                question.key().as_ref(),
                player.key().as_ref()
            ],
            bump = bump
        )]
        answer: Account<'info, Answer>,
        #[account(mut, has_one = authority, has_one = trivia)]
        player: Account<'info, Player>,
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    #[access_control(access::player(&ctx.accounts.trivia, &ctx.accounts.player, &ctx.accounts.authority))]
    pub fn submit_answer(ctx: Context<SubmitAnswer>, variant_id: u32, bump: u8) -> ProgramResult {
        let game = &ctx.accounts.game;
        let question = &mut ctx.accounts.question;
        let answer = &mut ctx.accounts.answer;
        let player = &mut ctx.accounts.player;

        require!(game.started, ErrorCode::GameNotStarted);
        require!(
            question.revealed_question.is_some(),
            ErrorCode::QuestionIsNotRevealed
        );
        require!(
            question.revealed_question.as_ref().unwrap().deadline > Clock::get()?.unix_timestamp,
            ErrorCode::QuestionDeadlineExceeded
        );

        answer.question = question.key();
        answer.authority = ctx.accounts.authority.key();
        answer.bump = bump;
        answer.variant_id = variant_id;

        question
            .revealed_question
            .as_mut()
            .unwrap()
            .answers
            .get_mut(variant_id as usize)
            .ok_or(ErrorCode::VariantDoesNotExist)?
            .push(answer.key());

        let question_id = game
            .questions
            .iter()
            .position(|&q| q == question.key())
            .ok_or(ErrorCode::QuestionDoesNotExist)?;

        if question_id == game.questions.len() - 1 {
            player.finished_games_counter += 1;
        }

        Ok(())
    }

    #[derive(Accounts)]
    pub struct RevealAnswer<'info> {
        #[account(mut, constraint = question.game == game.key())]
        game: Account<'info, Game>,
        #[account(mut, has_one = authority)]
        question: Account<'info, Question>,
        authority: Signer<'info>,
    }

    #[access_control(access::admin(&ctx.accounts.question.authority, &ctx.accounts.authority))]
    pub fn reveal_answer(ctx: Context<RevealAnswer>, revealed_variant_id: u32) -> ProgramResult {
        let game = &mut ctx.accounts.game;
        let question = &mut ctx.accounts.question;

        require!(game.started, ErrorCode::GameNotStarted);
        require!(
            question.revealed_question.is_some(),
            ErrorCode::QuestionIsNotRevealed
        );
        require!(
            question.revealed_question.as_ref().unwrap().deadline <= Clock::get()?.unix_timestamp,
            ErrorCode::QuestionDeadlineNotExceeded
        );
        require!(
            revealed_variant_id < question.variants.len() as u32,
            ErrorCode::VariantDoesNotExist
        );

        question
            .revealed_question
            .as_mut()
            .unwrap()
            .answer_variant_id = Some(revealed_variant_id);

        emit!(RevealAnswerEvent {
            game: game.key(),
            question: question.key()
        });

        Ok(())
    }
}

fn remove_question_from_game(game: &mut Account<Game>, question_key: Pubkey) -> ProgramResult {
    require!(!game.started, ErrorCode::GameAlreadyStarted);

    let len_before = game.questions.len();
    game.questions.retain(|question| question != &question_key);
    let len_after = game.questions.len();

    require!(len_before != len_after, ErrorCode::QuestionDoesNotExist);

    Ok(())
}
