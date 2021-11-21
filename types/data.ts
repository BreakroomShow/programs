import * as anchor from "@project-serum/anchor"

export interface Trivia {
    authority: anchor.web3.PublicKey
}

export interface Game {
    trivia: anchor.web3.PublicKey
    authority: anchor.web3.PublicKey

    started: boolean
    name: string
    questions: anchor.web3.PublicKey[]
    revealedQuestionsCounter: number
}

export interface Question {
    game: anchor.web3.PublicKey
    authority: anchor.web3.PublicKey

    question: string // SHA256 hash of question == sha256(question)
    variants: string[] // SHA256 hashes of answers == sha256(sha256(question) + answer))
    time: anchor.BN // seconds

    revealedQuestion?: RevealedQuestion
}

export interface RevealedQuestion {
    question: string
    variants: string[]
    deadline: anchor.BN // unix timestamp in seconds
    answers: anchor.web3.PublicKey[][]

    answerVariantId?: number
}

export interface Answer {
    question: anchor.web3.PublicKey
    user: anchor.web3.PublicKey

    variantId: number
}
