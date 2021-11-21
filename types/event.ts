import * as anchor from "@project-serum/anchor"

export interface StartGameEvent {
    game: anchor.web3.PublicKey
}

export interface RevealQuestionEvent {
    game: anchor.web3.PublicKey
    question: anchor.web3.PublicKey
}

export interface RevealAnswerEvent {
    game: anchor.web3.PublicKey
    question: anchor.web3.PublicKey
}
