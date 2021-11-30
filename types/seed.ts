import * as anchor from '@project-serum/anchor'
import {PublicKey} from '@solana/web3.js'

import {TriviaProgram} from './data'

const TRIVIA = 'trivia'
const GAME = 'game'
const USER = 'user'
const PLAYER = 'player'
const ANSWER = 'answer'

export type PDA = [PublicKey, number]

export function TriviaPDA(programId: TriviaProgram['programId']): Promise<PDA> {
    return PublicKey.findProgramAddress([Buffer.from(TRIVIA)], programId)
}

export function GamePDA(
    programId: TriviaProgram['programId'],
    trivia: PublicKey,
    gameIndex: number,
): Promise<PDA> {
    return PublicKey.findProgramAddress(
        [Buffer.from(GAME), trivia.toBuffer(), Buffer.from(gameIndex.toString())],
        programId,
    )
}

export function UserPDA(
    programId: TriviaProgram['programId'],
    trivia: PublicKey,
    user: PublicKey
): Promise<PDA> {
    return PublicKey.findProgramAddress([Buffer.from(USER), trivia.toBuffer(), user.toBuffer()], programId)
}

export function PlayerPDA(
    programId: TriviaProgram['programId'],
    game: PublicKey,
    user: PublicKey
): Promise<PDA> {
    return PublicKey.findProgramAddress([Buffer.from(PLAYER), game.toBuffer(), user.toBuffer()], programId)
}

export function AnswerPDA(
    programId: TriviaProgram['programId'],
    question: PublicKey,
    player: PublicKey
): Promise<PDA> {
    return PublicKey.findProgramAddress([Buffer.from(ANSWER), question.toBuffer(), player.toBuffer()], programId)
}
