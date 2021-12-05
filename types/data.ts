import * as anchor from '@project-serum/anchor'

import {TriviaIdl} from './index'
import {Optional} from "./common"
import {IdlAccounts, IdlTypes} from "@project-serum/anchor"

export type TriviaProgram = anchor.Program<TriviaIdl>

export interface Game extends Omit<IdlAccounts<TriviaIdl>["game"], "questionKeys"> {
    questionKeys: (anchor.web3.PublicKey | null)[]
    questions?: IdlAccounts<TriviaIdl>["question"][]
}

export interface CreateGameOptions {
    name: string
    startTime: anchor.BN
}

export interface EditGameOptions extends Optional<CreateGameOptions> {
}

export interface Question extends Omit<IdlAccounts<TriviaIdl>["question"], "revealedQuestion"> {
    revealedQuestion?: RevealedQuestion
}

export interface RevealedQuestion extends Omit<IdlTypes<TriviaIdl>["RevealedQuestion"], "answerKeys"> {
    answerKeys: anchor.web3.PublicKey[][]
    answers?: Answer[]
}

export interface Answer {
    question: anchor.web3.PublicKey
    authority: anchor.web3.PublicKey

    variantId: number
}
