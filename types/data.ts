import * as anchor from "@project-serum/anchor"

export interface Trivia {
    authority: anchor.web3.PublicKey

    gamesCounter: number
}

export interface Player {
    trivia: anchor.web3.PublicKey
    authority: anchor.web3.PublicKey

    finishedGamesCounter: number
    leftInvitesCounter: number
}

export interface Game {
    trivia: anchor.web3.PublicKey
    authority: anchor.web3.PublicKey

    name: string
    startTime: anchor.BN
    questionKeys: anchor.web3.PublicKey[]
    questions?: Question[]
    revealedQuestionsCounter: number
}

export interface GameOptions {
    name?: string
    startTime?: anchor.BN
}

export interface Question {
    game: anchor.web3.PublicKey
    authority: anchor.web3.PublicKey

    question: number[] // SHA256 hash of question == sha256(question)
    variants: number[][] // SHA256 hashes of answers == sha256(sha256(question) + answer))
    time: anchor.BN // seconds

    revealedQuestion?: RevealedQuestion
}

export interface RevealedQuestion {
    question: string
    variants: string[]
    deadline: anchor.BN // unix timestamp in seconds
    answerKeys: anchor.web3.PublicKey[][]
    answers?: Answer[]

    answerVariantId?: number
}

export interface Answer {
    question: anchor.web3.PublicKey
    authority: anchor.web3.PublicKey

    variantId: number
}
