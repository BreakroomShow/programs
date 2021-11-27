use anchor_lang::prelude::*;

#[event]
pub struct EditGameEvent {
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
}
