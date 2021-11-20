use anchor_lang::prelude::*;

#[account]
pub struct Trivia {
    pub authority: Pubkey,
}

#[account]
pub struct Game {
    pub trivia: Pubkey, // Trivia this game belongs to
    pub started: bool,
    pub name: String,
    pub questions: Vec<Pubkey>,
    pub revealed_questions_counter: u32,
    pub authority: Pubkey,
}

#[account]
#[derive(Default)]
pub struct Question {
    pub game: Pubkey,            // Game this question belongs to
    pub question: [u8; 32],      // SHA256 hash of question == sha256(question)
    pub variants: Vec<[u8; 32]>, // SHA256 hashes of answers == sha256(sha256(question) + answer))
    pub revealed_question: Option<String>,
    pub revealed_variants: Option<Vec<String>>,
    pub votes: Vec<Pubkey>,
    pub authority: Pubkey,
}

#[account]
pub struct Answer {
    pub question: Pubkey, // Question this answer belongs to
    // TODO: hide so other users can't see it until answering period ends
    pub variant_id: u32,
    pub user: Pubkey,
}
