use anchor_lang::prelude::*;

#[account]
pub struct Trivia {
    pub authority: Pubkey,
    pub games: Vec<Game>,
}

#[derive(Debug, Clone, Default, AnchorSerialize, AnchorDeserialize)]
pub struct Game {
    pub id: u32,
    pub name: String,
    pub questions: Vec<Question>,
    pub revealed_questions: Vec<RevealedQuestion>,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Question {
    pub question: [u8; 32], // SHA256 hash of question == sha256(question)
    pub revealed_question: Option<String>,
    pub variants: Vec<[u8; 32]>, // SHA256 hashes of answers == sha256(sha256(question) + answer))
    pub revealed_variants: Option<Vec<String>>,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct RevealedQuestion {
    pub question: String,
    pub variants: Vec<String>,
}
