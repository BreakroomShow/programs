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
pub struct Player {
    pub trivia: Pubkey, // Trivia this Game belongs to
    pub authority: Pubkey,
    pub bump: u8,

    pub finished_games_counter: u32,
    pub left_invites_counter: u32,
}

#[account]
pub struct Game {
    pub trivia: Pubkey, // Trivia this Game belongs to
    pub authority: Pubkey,
    pub bump: u8,

    pub name: String,
    pub start_time: u64,
    pub question_keys: Vec<Pubkey>,
    pub revealed_questions_counter: u32,
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

#[derive(Default, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct RevealedQuestion {
    pub question: String,
    pub variants: Vec<String>,
    pub deadline: u64, // unix timestamp in seconds
    pub answer_keys: Vec<Vec<Pubkey>>,

    pub answer_variant_id: Option<u32>,
}

#[account]
#[derive(Default)]
pub struct Answer {
    pub question: Pubkey, // Question this Answer belongs to
    pub authority: Pubkey,
    pub bump: u8,

    // TODO: hide so other users can't see it until answering period ends
    pub variant_id: u32,
}
