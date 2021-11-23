use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct Trivia {
    pub authority: Pubkey,
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

    pub started: bool,
    pub name: String,
    pub questions: Vec<Pubkey>,
    pub revealed_questions_counter: u32,
}

#[account]
#[derive(Default)]
pub struct Question {
    pub game: Pubkey, // Game this Question belongs to
    pub authority: Pubkey,

    pub question: [u8; 32],      // SHA256 hash of question == sha256(question)
    pub variants: Vec<[u8; 32]>, // SHA256 hashes of answers == sha256(sha256(question) + answer))
    pub time: i64,               // seconds
    pub revealed_question: Option<RevealedQuestion>,
}

#[derive(Default, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct RevealedQuestion {
    pub question: String,
    pub variants: Vec<String>,
    pub deadline: i64, // unix timestamp in seconds
    pub answers: Vec<Vec<Pubkey>>,

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
