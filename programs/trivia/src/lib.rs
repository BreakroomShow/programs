use anchor_lang::prelude::{borsh::BorshSerialize, *};
use anchor_lang::solana_program::hash::{extend_and_hash, hash, Hash};

use crate::data::{Answer, Game, GameOptions, Question, RevealedQuestion, Trivia, User};
use crate::error::ErrorCode;
use crate::event::{EditGameEvent, RevealAnswerEvent, RevealQuestionEvent};

mod access;
mod data;
mod error;
mod event;
mod seed;

declare_id!("F6JZ61gqo32Mwv4XBwGsVmamsaZCgyVoz8VUvefsqUhm");

const INVITES_AFTER_FIRST_GAME: u32 = 3;

#[program]
mod trivia {
    use crate::data::Player;

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
    #[instruction(user_key: Pubkey, bump: u8)]
    pub struct WhitelistUser<'info> {
        #[account(has_one = authority @ ErrorCode::Unauthorized)]
        trivia: Account<'info, Trivia>,
        #[account(
            init,
            payer = authority,
            seeds = [seed::USER.as_ref(), trivia.key().as_ref(), user_key.as_ref()],
            bump = bump
        )]
        whitelisted_user: Account<'info, User>,
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    pub fn whitelist_user(
        ctx: Context<WhitelistUser>,
        user_key: Pubkey,
        bump: u8,
    ) -> ProgramResult {
        let user = &mut ctx.accounts.whitelisted_user;

        user.trivia = ctx.accounts.trivia.key();
        user.authority = user_key;
        user.bump = bump;

        Ok(())
    }

    #[derive(Accounts)]
    pub struct AddUserInvite<'info> {
        #[account(has_one = authority)]
        trivia: Account<'info, Trivia>,
        #[account(mut, has_one = trivia)]
        user: Account<'info, User>,
        authority: Signer<'info>,
    }

    #[access_control(access::admin(&ctx.accounts.trivia.authority, &ctx.accounts.authority))]
    pub fn add_user_invite(ctx: Context<AddUserInvite>) -> ProgramResult {
        ctx.accounts.user.left_invites_counter += 1;

        Ok(())
    }

    #[derive(Accounts)]
    #[instruction(user_key: Pubkey, bump: u8)]
    pub struct InviteUser<'info> {
        #[account()]
        trivia: Account<'info, Trivia>,
        #[account(
            init,
            payer = authority,
            seeds = [
                seed::USER.as_ref(),
                trivia.key().as_ref(),
                user_key.as_ref()
            ],
            bump = bump
        )]
        invited_user: Account<'info, User>,
        #[account(mut, has_one = authority, has_one = trivia)]
        user: Account<'info, User>,
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    #[access_control(access::user(&ctx.accounts.trivia, &ctx.accounts.user))]
    pub fn invite_user(ctx: Context<InviteUser>, user_key: Pubkey, bump: u8) -> ProgramResult {
        let user = &mut ctx.accounts.user;
        let invited_user = &mut ctx.accounts.invited_user;

        require!(
            user.left_invites_counter > 0,
            ErrorCode::NotEnoughInvitesLeft
        );

        invited_user.trivia = ctx.accounts.trivia.key();
        invited_user.authority = user_key;
        invited_user.bump = bump;

        user.left_invites_counter -= 1;

        Ok(())
    }

    #[derive(Accounts)]
    #[instruction(options: GameOptions, bump: u8)]
    pub struct CreateGame<'info> {
        #[account(mut, has_one = authority)]
        trivia: Account<'info, Trivia>,
        #[account(
            init,
            payer = authority,
            seeds = [
                seed::GAME.as_ref(),
                trivia.key().as_ref(),
                trivia.games_counter.to_string().as_ref()
            ],
            bump = bump,
            space = Game::space()
        )]
        game: Account<'info, Game>,
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    #[access_control(access::admin(&ctx.accounts.trivia.authority, &ctx.accounts.authority))]
    pub fn create_game(ctx: Context<CreateGame>, options: GameOptions, bump: u8) -> ProgramResult {
        let trivia = &mut ctx.accounts.trivia;
        let game = &mut ctx.accounts.game;

        let name = options.name.ok_or(ErrorCode::InvalidGameName)?;
        let start_time = options.start_time.ok_or(ErrorCode::InvalidGameStartTime)?;

        require!(!name.is_empty(), ErrorCode::InvalidGameName);
        require!(
            start_time > Clock::get()?.unix_timestamp as u64,
            ErrorCode::InvalidGameStartTime
        );

        game.trivia = trivia.key();
        game.authority = ctx.accounts.authority.key();
        game.bump = bump;
        game.name = name;
        game.start_time = start_time;

        trivia.games_counter += 1;

        Ok(())
    }

    #[derive(Accounts)]
    pub struct EditGame<'info> {
        #[account(mut, has_one = authority)]
        game: Account<'info, Game>,
        authority: Signer<'info>,
    }

    #[access_control(access::admin(&ctx.accounts.game.authority, &ctx.accounts.authority))]
    pub fn edit_game(ctx: Context<EditGame>, options: GameOptions) -> ProgramResult {
        let game = &mut ctx.accounts.game;

        require!(!game.started()?, ErrorCode::GameAlreadyStarted);

        if let Some(name) = options.name {
            require!(!name.is_empty(), ErrorCode::InvalidGameName);
            game.name = name
        }

        if let Some(start_time) = options.start_time {
            require!(
                start_time > Clock::get()?.unix_timestamp as u64,
                ErrorCode::InvalidGameStartTime
            );
            game.start_time = start_time;
        }

        emit!(EditGameEvent { game: game.key() });

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

        require!(!game.started()?, ErrorCode::GameAlreadyStarted);

        game.start_time = Clock::get()?.unix_timestamp as u64;

        emit!(EditGameEvent { game: game.key() });

        Ok(())
    }

    #[derive(Accounts)]
    pub struct AddQuestion<'info> {
        #[account(mut, has_one = authority)]
        game: Account<'info, Game>,
        #[account(init, payer = authority, space = Question::space())]
        question: Account<'info, Question>,
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    #[access_control(access::admin(&ctx.accounts.game.authority, &ctx.accounts.authority))]
    pub fn add_question(
        ctx: Context<AddQuestion>,
        name: [u8; 32],
        variants: Vec<[u8; 32]>,
        time: u64,
    ) -> ProgramResult {
        let game = &mut ctx.accounts.game;
        let question = &mut ctx.accounts.question;

        require!(!game.started()?, ErrorCode::GameAlreadyStarted);

        question.game = game.key();
        question.question = name;
        question.variants = variants;
        question.authority = ctx.accounts.authority.key();
        question.time = time;

        game.question_keys.push(question.key());

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
        let game = &mut ctx.accounts.game;

        require!(!game.started()?, ErrorCode::GameAlreadyStarted);

        remove_question_from_game(game, question_key)?;

        Ok(())
    }

    #[access_control(access::admin(&ctx.accounts.game.authority, &ctx.accounts.authority))]
    pub fn move_question(
        ctx: Context<EditQuestion>,
        question_key: Pubkey,
        new_position: u32,
    ) -> ProgramResult {
        let game = &mut ctx.accounts.game;

        require!(!game.started()?, ErrorCode::GameAlreadyStarted);

        remove_question_from_game(game, question_key)?;

        ctx.accounts
            .game
            .question_keys
            .insert(new_position as usize, question_key);

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

        require!(game.started()?, ErrorCode::GameNotStarted);

        let question_id = game
            .question_keys
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
            deadline: Clock::get()?.unix_timestamp as u64 + question.time,
            answer_keys: vec![vec![]; question.variants.len()],
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
    #[instruction(variant_id: u32, player_bump: u8, answer_bump: u8)]
    pub struct SubmitAnswer<'info> {
        #[account()]
        trivia: Account<'info, Trivia>,
        #[account(has_one = trivia)]
        game: Box<Account<'info, Game>>,
        #[account(mut, has_one = authority, has_one = trivia)]
        user: Account<'info, User>,
        #[account(
            init_if_needed,
            payer = authority,
            seeds = [
                seed::PLAYER.as_ref(),
                game.key().as_ref(),
                user.key().as_ref()
            ],
            bump = player_bump,
            space = Player::space()
        )]
        player: Account<'info, Player>,
        #[account(mut, has_one = game)]
        question: Account<'info, Question>,
        #[account(
            init,
            payer = authority,
            seeds = [
                seed::ANSWER.as_ref(),
                question.key().as_ref(),
                player.key().as_ref()
            ],
            bump = answer_bump
        )]
        answer: Account<'info, Answer>,
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    #[access_control(access::user(&ctx.accounts.trivia, &ctx.accounts.user))]
    pub fn submit_answer(
        ctx: Context<SubmitAnswer>,
        variant_id: u32,
        player_bump: u8,
        answer_bump: u8,
    ) -> ProgramResult {
        let game = &ctx.accounts.game;
        let question = &mut ctx.accounts.question;
        let answer = &mut ctx.accounts.answer;
        let user = &mut ctx.accounts.user;
        let player = &mut ctx.accounts.player;
        let authority = &ctx.accounts.authority;

        require!(game.started()?, ErrorCode::GameNotStarted);
        require!(
            question.revealed_question.is_some(),
            ErrorCode::QuestionIsNotRevealed
        );
        require!(
            question.revealed_question.as_ref().unwrap().deadline
                > Clock::get()?.unix_timestamp as u64,
            ErrorCode::QuestionDeadlineExceeded
        );

        let question_id = game
            .question_keys
            .iter()
            .position(|&q| q == question.key())
            .ok_or(ErrorCode::QuestionDoesNotExist)?;

        require!(
            player.answers.len() == question_id,
            ErrorCode::PreviousQuestionWasNotAnswered
        );

        player.answers.push(variant_id);

        if player.authority.to_bytes() == [0; 32] {
            require!(question_id == 0, ErrorCode::GameAlreadyStarted);

            player.game = game.key();
            player.user = user.key();
            player.authority = authority.key();
            player.bump = player_bump;
        }

        if question_id == game.question_keys.len() - 1 {
            user.finished_games_counter += 1;

            if user.finished_games_counter == 1 && user.left_invites_counter == 0 {
                user.left_invites_counter = INVITES_AFTER_FIRST_GAME;
            }
        }

        answer.question = question.key();
        answer.authority = authority.key();
        answer.bump = answer_bump;
        answer.variant_id = variant_id;

        question
            .revealed_question
            .as_mut()
            .unwrap()
            .answer_keys
            .get_mut(variant_id as usize)
            .ok_or(ErrorCode::VariantDoesNotExist)?
            .push(answer.key());

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

        require!(game.started()?, ErrorCode::GameNotStarted);
        require!(
            question.revealed_question.is_some(),
            ErrorCode::QuestionIsNotRevealed
        );
        require!(
            question.revealed_question.as_ref().unwrap().deadline
                <= Clock::get()?.unix_timestamp as u64,
            ErrorCode::QuestionDeadlineNotExceeded
        );
        require!(
            revealed_variant_id < question.variants.len() as u32,
            ErrorCode::VariantDoesNotExist
        );
        require!(
            question
                .revealed_question
                .as_ref()
                .unwrap()
                .answer_variant_id
                .is_none(),
            ErrorCode::AnswerAlreadyRevealed
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
    require!(!game.started()?, ErrorCode::GameAlreadyStarted);

    let len_before = game.question_keys.len();
    game.question_keys
        .retain(|question| question != &question_key);
    let len_after = game.question_keys.len();

    require!(len_before != len_after, ErrorCode::QuestionDoesNotExist);

    Ok(())
}
