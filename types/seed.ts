import * as anchor from "@project-serum/anchor"
import {Program, web3} from "@project-serum/anchor"

export const TRIVIA = "trivia"
export const GAME = "game"
export const WHITELISTED_PLAYER = "whitelisted_player"
export const ANSWER = "answer"

export async function TriviaPDA(program: Program): Promise<[web3.PublicKey, number]> {
    return await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(TRIVIA)],
        program.programId
    )
}

export async function GamePDA(
    program: Program,
    trivia: web3.PublicKey,
    gamesCounter: number
): Promise<[web3.PublicKey, number]> {
    return await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(GAME), trivia.toBuffer(), Buffer.from(gamesCounter.toString())],
        program.programId
    )
}

export async function PlayerPDA(
    program: Program,
    trivia: web3.PublicKey,
    user: web3.PublicKey
): Promise<[web3.PublicKey, number]> {
    return await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(WHITELISTED_PLAYER), trivia.toBuffer(), user.toBuffer()],
        program.programId
    )
}

export async function AnswerPDA(
    program: Program,
    trivia: web3.PublicKey,
    game: web3.PublicKey,
    question: web3.PublicKey,
    player: web3.PublicKey
): Promise<[web3.PublicKey, number]> {
    return await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(ANSWER),
            trivia.toBuffer(),
            game.toBuffer(),
            question.toBuffer(),
            player.toBuffer()
        ],
        program.programId
    )
}
