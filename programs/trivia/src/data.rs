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
    pub questions: Vec<Question>,
    pub revealed_questions: Vec<RevealedQuestion>,
    pub authority: Pubkey,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Question {
    pub question: [u8; 32],      // SHA256 hash of question == sha256(question)
    pub variants: Vec<[u8; 32]>, // SHA256 hashes of answers == sha256(sha256(question) + answer))
}

#[derive(Debug, Clone, Default, AnchorSerialize, AnchorDeserialize)]
pub struct RevealedQuestion {
    pub question: String,
    pub variants: Vec<String>,
    pub votes: Vec<Pubkey>,
}

#[account]
pub struct Answer {
    pub game: Pubkey, // Game this answer belongs to
    // TODO: use separate `Question` account instead of index in Game.questions vector
    pub question_id: u32,
    // TODO: hide so other users can't see it until answering period ends
    pub variant_id: u32,
    pub user: Pubkey,
}
