use anchor_lang::prelude::*;

#[event]
pub struct StartGameEvent {
    pub game: Pubkey,
}

#[event]
pub struct RevealQuestionEvent {
    pub game: Pubkey,
    pub question: Pubkey,
}

#[event]
pub struct RevealAnswerEvent {
    pub game: Pubkey,
    pub question: Pubkey,
    pub answer_variant_id: u32,
}
