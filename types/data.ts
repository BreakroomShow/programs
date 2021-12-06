import * as anchor from '@project-serum/anchor'

import {Trivia} from './index'
import {Optional} from "./common"
import {IdlAccounts} from "@project-serum/anchor"

export type TriviaProgram = anchor.Program<Trivia>

export interface Game extends Omit<IdlAccounts<Trivia>["game"], "questionKeys"> {
    questionKeys: (anchor.web3.PublicKey | null)[]
    questions?: IdlAccounts<Trivia>["question"][]
}

export interface CreateGameOptions {
    name: string
    startTime: anchor.BN
}

export interface EditGameOptions extends Optional<CreateGameOptions> {
}
