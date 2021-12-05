use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct Trivia {
    pub authority: Pubkey,
    pub bump: u8,

    pub games_counter: u32,
}

#[account]
#[derive(Default)]
pub struct User {
    pub trivia: Pubkey, // Trivia this Game belongs to
    pub authority: Pubkey,
    pub bump: u8,

    pub finished_games_counter: u32,
    pub left_invites_counter: u32,
}

#[account]
#[derive(Default)]
pub struct Player {
    pub game: Pubkey, // Game this Player belongs to
    pub user: Pubkey, // User this Player belongs to
    pub authority: Pubkey,
    pub bump: u8,

    pub answers: Vec<u32>,
}

impl Player {
    pub fn space() -> usize {
        AnchorSerialize::try_to_vec(&Self {
            answers: vec![Default::default(); 12],
            ..Default::default()
        })
        .unwrap()
        .len()
    }
}

#[account]
#[derive(Default)]
pub struct Game {
    pub trivia: Pubkey, // Trivia this Game belongs to
    pub authority: Pubkey,
    pub bump: u8,

    pub name: String,
    pub start_time: u64,
    pub question_keys: Vec<Pubkey>,
    pub revealed_questions_counter: u32,
    pub correct_answers: Vec<u32>,
}

impl Game {
    pub fn space() -> usize {
        AnchorSerialize::try_to_vec(&Self {
            name: String::from_utf8(vec![0; 100]).unwrap(),
            question_keys: vec![Default::default(); 12],
            correct_answers: vec![Default::default(); 12],
            ..Default::default()
        })
        .unwrap()
        .len()
    }
}

impl Game {
    pub fn started(&self) -> Result<bool, ProgramError> {
        Ok(self.start_time <= Clock::get()?.unix_timestamp as u64)
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct GameOptions {
    pub name: Option<String>,
    pub start_time: Option<u64>, // unix timestamp in seconds
}

#[account]
#[derive(Default)]
pub struct Question {
    pub game: Pubkey, // Game this Question belongs to
    pub authority: Pubkey,

    pub question: [u8; 32],      // SHA256 hash of question == sha256(question)
    pub variants: Vec<[u8; 32]>, // SHA256 hashes of answers == sha256(sha256(question) + answer))
    pub time: u64,               // seconds
    pub revealed_question: Option<RevealedQuestion>,
}

impl Question {
    pub fn space() -> usize {
        AnchorSerialize::try_to_vec(&Self {
            revealed_question: Some(RevealedQuestion {
                question: String::from_utf8(vec![0; 100]).unwrap(),
                variants: vec![String::from_utf8(vec![0; 50]).unwrap(); 3],
                answer_variant_id: Some(Default::default()),
                ..Default::default()
            }),
            ..Default::default()
        })
        .unwrap()
        .len()
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct RevealedQuestion {
    pub question: String,
    pub variants: Vec<String>,
    pub deadline: u64, // unix timestamp in seconds

    pub answer_variant_id: Option<u32>,
}
