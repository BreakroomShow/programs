import * as _anchor from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'

import { TriviaProgram } from '../types'

let anchor = _anchor

export function setupTests(providedAnchor: typeof anchor) {
    anchor = providedAnchor
}

const TRIVIA = 'trivia'
const GAME = 'game'
const WHITELISTED_PLAYER = 'whitelisted_player'
const ANSWER = 'answer'

export type PdaResult = [PublicKey, number]

export function TriviaPDA(programId: TriviaProgram['programId']): Promise<PdaResult> {
    return anchor.web3.PublicKey.findProgramAddress([Buffer.from(TRIVIA)], programId)
}

export function GamePDA(
    programId: TriviaProgram['programId'],
    trivia: PublicKey,
    gamesCounter: number,
): Promise<PdaResult> {
    return anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(GAME), trivia.toBuffer(), Buffer.from(gamesCounter.toString())],
        programId,
    )
}

export function PlayerPDA(
    programId: TriviaProgram['programId'],
    trivia: PublicKey,
    user: PublicKey,
): Promise<PdaResult> {
    return anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(WHITELISTED_PLAYER), trivia.toBuffer(), user.toBuffer()],
        programId,
    )
}

export function AnswerPDA(
    programId: TriviaProgram['programId'],
    trivia: PublicKey,
    game: PublicKey,
    question: PublicKey,
    player: PublicKey,
): Promise<PdaResult> {
    return anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(ANSWER), trivia.toBuffer(), game.toBuffer(), question.toBuffer(), player.toBuffer()],
        programId,
    )
}
