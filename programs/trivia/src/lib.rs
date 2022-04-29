#![feature(derive_default_enum)]
use anchor_lang::prelude::{borsh::BorshSerialize, *};
use anchor_lang::solana_program::hash::{extend_and_hash, hash, Hash};

use crate::data::{Game, GameOptions, Question, RevealedQuestion, Trivia, User, WinClaimingStatus};
use crate::error::ErrorCode;
use crate::event::{EditGameEvent, RevealAnswerEvent, RevealQuestionEvent, WinClaimingStartedEvent};

mod access;
mod data;
mod error;
mod event;
mod seed;

use anchor_spl::token::{self, Mint, TokenAccount, Token};

declare_id!("Eb7ZLJqhTDmLDcoGbKUy6DKxSBraNEsfbDST4FWiXAwv");

const INVITES_AFTER_FIRST_GAME: u32 = 3;

#[program]
mod trivia {
    use crate::data::Player;

    use super::*;

    #[derive(Accounts)]
    #[instruction()]
    pub struct InitializeTrivia<'info> {
        #[account(
            init,
            payer = authority,
            seeds = [seed::TRIVIA.as_ref()],
            space = Trivia::space() + 8,
            bump
        )]
        trivia: Account<'info, Trivia>,
        #[account(mut)]
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    pub fn initialize(ctx: Context<InitializeTrivia>) -> Result<()> {
        let trivia = &mut ctx.accounts.trivia;

        trivia.authority = ctx.accounts.authority.key();
        trivia.bump = *ctx.bumps.get("trivia").unwrap();

        Ok(())
    }

    #[derive(Accounts)]
    #[instruction(user_key: Pubkey)]
    pub struct WhitelistUser<'info> {
        #[account(has_one = authority @ ErrorCode::Unauthorized)]
        trivia: Account<'info, Trivia>,
        #[account(
            init,
            payer = authority,
            seeds = [seed::USER.as_ref(), trivia.key().as_ref(), user_key.as_ref()],
            space = User::space() + 8,
            bump
        )]
        whitelisted_user: Account<'info, User>,
        #[account(mut)]
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    pub fn whitelist_user(
        ctx: Context<WhitelistUser>,
        user_key: Pubkey,
    ) -> Result<()> {
        let user = &mut ctx.accounts.whitelisted_user;

        user.trivia = ctx.accounts.trivia.key();
        user.authority = user_key;
        user.bump = *ctx.bumps.get("whitelisted_user").unwrap();

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
    pub fn add_user_invite(ctx: Context<AddUserInvite>) -> Result<()> {
        ctx.accounts.user.left_invites_counter += 1;

        Ok(())
    }

    #[derive(Accounts)]
    #[instruction(user_key: Pubkey)]
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
            space = User::space() + 8,
            bump
        )]
        invited_user: Account<'info, User>,
        #[account(mut, has_one = authority, has_one = trivia)]
        user: Account<'info, User>,
        #[account(mut)]
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    #[access_control(access::user(&ctx.accounts.trivia, &ctx.accounts.user))]
    pub fn invite_user(ctx: Context<InviteUser>, user_key: Pubkey) -> Result<()> {
        let user = &mut ctx.accounts.user;
        let invited_user = &mut ctx.accounts.invited_user;

        require!(
            user.left_invites_counter > 0,
            ErrorCode::NotEnoughInvitesLeft
        );

        invited_user.trivia = ctx.accounts.trivia.key();
        invited_user.authority = user_key;
        invited_user.bump = *ctx.bumps.get("invited_user").unwrap();

        user.left_invites_counter -= 1;

        Ok(())
    }

    #[derive(Accounts)]
    #[instruction(options: GameOptions)]
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
            bump,
            space = Game::space() + 8
        )]
        game: Box<Account<'info, Game>>,
        prize_fund_mint: Account<'info, Mint>,
        #[account(
            init,
            seeds = [
                seed::VAULT.as_ref(),
                game.key().as_ref()
            ],
            bump,
            payer = authority,
            token::mint = prize_fund_mint,
            token::authority = prize_fund_vault_authority,
        )]
        prize_fund_vault: Account<'info, TokenAccount>,
        #[account(
            mut,
            constraint = prize_fund_deposit.amount >= options.prize_fund_amount.unwrap_or(0),
            constraint = prize_fund_deposit.mint == prize_fund_mint.key(),
            constraint = prize_fund_deposit.owner == authority.key(),
        )]
        prize_fund_deposit: Account<'info, TokenAccount>,
        #[account(
            seeds = [
                seed::VAULT_AUTHORITY.as_ref(),
                game.key().as_ref()
            ],
            bump
        )]
        /// CHECK: only used as PDA authority
        prize_fund_vault_authority: UncheckedAccount<'info>,
        #[account(mut)]
        authority: Signer<'info>,
        system_program: Program<'info, System>,
        token_program: Program<'info, Token>,
        rent: Sysvar<'info, Rent>,
    }

    #[access_control(access::admin(&ctx.accounts.trivia.authority, &ctx.accounts.authority))]
    pub fn create_game(ctx: Context<CreateGame>,
                       options: GameOptions) -> Result<()> {
        let trivia = &mut ctx.accounts.trivia;
        let game = &mut ctx.accounts.game;

        let name = options.name.ok_or(ErrorCode::InvalidGameName)?;
        let start_time = options.start_time.ok_or(ErrorCode::InvalidGameStartTime)?;
        let prize_fund_amount = options.prize_fund_amount.ok_or(ErrorCode::InvalidPrizeFundAmount)?;

        require!(!name.is_empty(), ErrorCode::InvalidGameName);
        require!(
            start_time > Clock::get()?.unix_timestamp as u64,
            ErrorCode::InvalidGameStartTime
        );
        require!(prize_fund_amount > 0, ErrorCode::InvalidPrizeFundAmount);

        game.trivia = trivia.key();
        game.authority = ctx.accounts.authority.key();
        game.bump = *ctx.bumps.get("game").unwrap();
        game.name = name;
        game.start_time = start_time;
        game.winners = 0;
        game.win_claiming_status = WinClaimingStatus::NotStarted;

        game.prize_fund_vault = ctx.accounts.prize_fund_vault.to_account_info().key();
        game.prize_fund_amount = prize_fund_amount;
        game.prize_fund_vault_authority = ctx.accounts.prize_fund_vault_authority.key();
        game.prize_fund_vault_authority_bump = *ctx.bumps.get("prize_fund_vault_authority").unwrap();

        {
            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.prize_fund_deposit.to_account_info().clone(),
                    to: ctx.accounts.prize_fund_vault.to_account_info().clone(),
                    authority: ctx.accounts.authority.to_account_info().clone(),
                },
            );
            token::transfer(cpi_ctx, prize_fund_amount)?;
        }

        trivia.games_counter += 1;

        Ok(())
    }

    #[derive(Accounts)]
    pub struct EditGame<'info> {
        #[account(mut, has_one = authority)]
        game: Box<Account<'info, Game>>,
        authority: Signer<'info>,
    }

    #[access_control(access::admin(&ctx.accounts.game.authority, &ctx.accounts.authority))]
    pub fn edit_game(ctx: Context<EditGame>, options: GameOptions) -> Result<()> {
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
    pub fn start_game(ctx: Context<StartGame>) -> Result<()> {
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
        #[account(init, payer = authority, space = Question::space() + 8)]
        question: Account<'info, Question>,
        #[account(mut)]
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    #[access_control(access::admin(&ctx.accounts.game.authority, &ctx.accounts.authority))]
    pub fn add_question(
        ctx: Context<AddQuestion>,
        name: [u8; 32],
        variants: Vec<[u8; 32]>,
        time: u64,
    ) -> Result<()> {
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
    pub fn remove_question(ctx: Context<EditQuestion>, question_key: Pubkey) -> Result<()> {
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
    ) -> Result<()> {
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
    ) -> Result<()> {
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
            revealed_question_hash == Hash::new(&question.question),
            ErrorCode::InvalidQuestionHash
        );
        require!(
            revealed_variants.len() == question.variants.len(),
            ErrorCode::InvalidQuestionVariantHash
        );

        for (revealed_variant, variant) in revealed_variants
            .iter()
            .zip(question.variants.iter().map(|&variant| Hash::new(&variant)))
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
    #[instruction(variant_id: u32)]
    pub struct SubmitAnswer<'info> {
        #[account()]
        trivia: Account<'info, Trivia>,
        #[account(has_one = trivia)]
        game: Box<Account<'info, Game>>,
        #[account(
            init_if_needed,
            payer = fee_payer,
            seeds = [
                seed::USER.as_ref(),
                trivia.key().as_ref(),
                authority.key().as_ref()
            ],
            space = User::space() + 8,
            bump
        )]
        user: Account<'info, User>,
        #[account(
            init_if_needed,
            payer = fee_payer,
            seeds = [
                seed::PLAYER.as_ref(),
                game.key().as_ref(),
                user.key().as_ref()
            ],
            bump,
            space = Player::space() + 8
        )]
        player: Account<'info, Player>,
        #[account(mut, has_one = game)]
        question: Account<'info, Question>,
        authority: Signer<'info>,
        #[account(mut)]
        fee_payer: Signer<'info>,
        system_program: Program<'info, System>,
    }

    pub fn submit_answer(
        ctx: Context<SubmitAnswer>,
        variant_id: u32,
    ) -> Result<()> {
        let trivia = &ctx.accounts.trivia;
        let game = &ctx.accounts.game;
        let question = &mut ctx.accounts.question;
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

        if user.authority.to_bytes() == [0; 32] {
            user.trivia = trivia.key();
            user.authority = authority.key();
            user.bump = *ctx.bumps.get("user").unwrap();
        }

        if player.authority.to_bytes() == [0; 32] {
            require!(question_id == 0, ErrorCode::GameAlreadyStarted);

            player.game = game.key();
            player.user = user.key();
            player.authority = authority.key();
            player.bump = *ctx.bumps.get("player").unwrap();
            player.claimed_win = false;
            player.claimed_prize = false;
        }

        if question_id == game.question_keys.len() - 1 {
            user.finished_games_counter += 1;

            if user.finished_games_counter == 1 && user.left_invites_counter == 0 {
                user.left_invites_counter = INVITES_AFTER_FIRST_GAME;
            }
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
    pub fn reveal_answer(ctx: Context<RevealAnswer>, revealed_variant_id: u32) -> Result<()> {
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

        game.correct_answers.push(revealed_variant_id);

        emit!(RevealAnswerEvent {
            game: game.key(),
            question: question.key()
        });

        Ok(())
    }

    #[derive(Accounts)]
    pub struct StartWinClaiming<'info> {
        #[account(mut, has_one = authority)]
        game: Account<'info, Game>,
        authority: Signer<'info>,
    }

    #[access_control(access::admin(&ctx.accounts.game.authority, &ctx.accounts.authority))]
    pub fn start_win_claiming(ctx: Context<StartWinClaiming>) -> Result<()> {
        let game = &mut ctx.accounts.game;

        require!(game.started()?, ErrorCode::GameNotStarted);
        require!(game.win_claiming_status == WinClaimingStatus::NotStarted, ErrorCode::WinClaimingAlreadyStarted);

        game.win_claiming_status = WinClaimingStatus::Active;

        emit!(WinClaimingStartedEvent {
            game: game.key(),
        });

        Ok(())
    }

    #[derive(Accounts)]
    pub struct FinishWinClaiming<'info> {
        #[account(mut, has_one = authority)]
        game: Account<'info, Game>,
        authority: Signer<'info>,
    }

    #[access_control(access::admin(&ctx.accounts.game.authority, &ctx.accounts.authority))]
    pub fn finish_win_claiming(ctx: Context<FinishWinClaiming>) -> Result<()> {
        let game = &mut ctx.accounts.game;

        require!(game.started()?, ErrorCode::GameNotStarted);
        require!(game.win_claiming_status == WinClaimingStatus::Active, ErrorCode::WinClaimingNotActive);

        game.win_claiming_status = WinClaimingStatus::Finished;

        Ok(())
    }

    #[derive(Accounts)]
    pub struct ClaimWin<'info> {
        #[account()]
        trivia: Account<'info, Trivia>,
        #[account(mut, has_one = trivia)]
        game: Account<'info, Game>,
        #[account(has_one = authority, has_one = trivia)]
        user: Account<'info, User>,
        #[account(mut, has_one = authority, has_one = user)]
        player: Account<'info, Player>,
        authority: Signer<'info>,
        system_program: Program<'info, System>,
    }

    #[access_control(access::user(&ctx.accounts.trivia, &ctx.accounts.user))]
    pub fn claim_win(
        ctx: Context<ClaimWin>,
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let player = &mut ctx.accounts.player;

        require!(game.started()?, ErrorCode::GameNotStarted);
        require!(!player.claimed_win, ErrorCode::WinAlreadyClaimed);
        require!(game.win_claiming_status == WinClaimingStatus::Active, ErrorCode::WinClaimingNotActive);
        require!(player.answers.len() == game.correct_answers.len(), ErrorCode::AnswerCountMismatch);

        for (player_answer, correct_answer) in player.answers.iter()
            .zip(game.correct_answers.iter())
        {
            require!(player_answer == correct_answer, ErrorCode::WrongAnswer);
            // todo: extra lifes
        }

        player.claimed_win = true;
        game.winners += 1;

        Ok(())
    }

    #[derive(Accounts)]
    #[instruction()]
    pub struct ClaimPrize<'info> {
        #[account()]
        trivia: Account<'info, Trivia>,
        #[account(has_one = trivia)]
        game: Box<Account<'info, Game>>,
        #[account(has_one = authority, has_one = trivia)]
        user: Account<'info, User>,
        #[account(mut, has_one = authority, has_one = user, has_one = game)]
        player: Box<Account<'info, Player>>,
        #[account(
            mut,
            constraint = prize_fund_vault.key() == game.prize_fund_vault,
            constraint = prize_fund_vault.owner == prize_fund_vault_authority.key()
        )]
        prize_fund_vault: Account<'info, TokenAccount>,
        #[account(
            mut,
            constraint = prize_fund_vault_authority.key() == game.prize_fund_vault_authority,
        )]
        /// CHECK: only used as PDA authority
        prize_fund_vault_authority: UncheckedAccount<'info>,
        #[account(
            mut,
            constraint = target_account.mint == prize_fund_vault.mint.key(),
        )]
        target_account: Account<'info, TokenAccount>,
        authority: Signer<'info>,
        system_program: Program<'info, System>,
        token_program: Program<'info, Token>,
    }

    #[access_control(access::user(&ctx.accounts.trivia, &ctx.accounts.user))]
    pub fn claim_prize(
        ctx: Context<ClaimPrize>,
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let player = &mut ctx.accounts.player;

        require!(game.started()?, ErrorCode::GameNotStarted);
        require!(game.win_claiming_status == WinClaimingStatus::Finished, ErrorCode::WinClaimingNotFinished);
        require!(player.claimed_win, ErrorCode::NoWinClaimed);
        require!(!player.claimed_prize, ErrorCode::PrizeAlreadyClaimed);

        player.claimed_prize = true;

        {
            let game_key = game.key();
            let seeds = &[seed::VAULT_AUTHORITY.as_ref(), game_key.as_ref(), &[game.prize_fund_vault_authority_bump]];
            let signer = &[&seeds[..]];

            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.prize_fund_vault.to_account_info(),
                    to: ctx.accounts.target_account.to_account_info(),
                    authority: ctx.accounts.prize_fund_vault_authority.to_account_info(),
                },
                signer
            );
            token::transfer(cpi_ctx, game.prize())?;
        }

        Ok(())
    }

    // todo: probably, make an event to stop claiming questions
}

fn remove_question_from_game(game: &mut Account<Game>, question_key: Pubkey) -> Result<()> {
    require!(!game.started()?, ErrorCode::GameAlreadyStarted);

    let len_before = game.question_keys.len();
    game.question_keys
        .retain(|question| question != &question_key);
    let len_after = game.question_keys.len();

    require!(len_before != len_after, ErrorCode::QuestionDoesNotExist);

    Ok(())
}
