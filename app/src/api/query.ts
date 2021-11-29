import * as anchor from '@project-serum/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import * as solana from '@solana/web3.js'
import { QueryClient, useQuery } from 'react-query'

import { network, preflightCommitment, programID, triviaIdl } from '../config'
import { TriviaIdl } from '../types'
import { GamePDA, PlayerPDA, TriviaPDA } from './seed'

const noopPda = [null, null] as const

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // TODO consider inlining it
            staleTime: Infinity,
        },
    },
})

export function useProvider() {
    const wallet = useWallet()

    const provider = useQuery(['provider', wallet.publicKey], () => {
        return new anchor.Provider(
            new solana.Connection(network, preflightCommitment),
            wallet as unknown as anchor.Wallet,
            { preflightCommitment },
        )
    }).data

    return [provider, provider?.wallet.publicKey] as const
}

export function useProgram() {
    const [provider, userPublicKey] = useProvider()

    return [
        useQuery(
            ['program', userPublicKey],
            () => {
                if (!provider) return

                return new anchor.Program<TriviaIdl>(triviaIdl, programID, provider)
            },
            { enabled: !!provider },
        ).data,
        userPublicKey,
    ] as const
}

export function useTriviaPda() {
    return useQuery(['triviaPda'], () => TriviaPDA(programID)).data || noopPda
}

export function useGamePda(gameIndex?: number) {
    const [triviaPda] = useTriviaPda()

    return (
        useQuery(['gamePda', gameIndex, triviaPda], () => {
            if (!triviaPda) return
            if (gameIndex == null) return

            return GamePDA(programID, triviaPda, gameIndex)
        }).data || noopPda
    )
}

export function usePlayerPda() {
    const [triviaPda] = useTriviaPda()
    const [, userPublicKey] = useProvider()

    return (
        useQuery(['playerPda', userPublicKey, triviaPda], () => {
            if (!triviaPda) return
            if (!userPublicKey) return

            return PlayerPDA(programID, triviaPda, userPublicKey)
        }).data || noopPda
    )
}

export function useGameQuery(gameIndex?: number) {
    const [program, userPublicKey] = useProgram()
    const [gamePda] = useGamePda(gameIndex)

    return useQuery(
        ['game', gameIndex, gamePda, userPublicKey],
        () => {
            if (!gamePda) return
            if (!program) return

            return program.account.game.fetch(gamePda)
        },
        { enabled: !!program },
    )
}

export function useTriviaQuery() {
    const [triviaPda] = useTriviaPda()
    const [program, userPublicKey] = useProgram()

    return useQuery(
        ['trivia', triviaPda, userPublicKey],
        () => {
            if (!triviaPda) return
            if (!program) return

            return program.account.trivia.fetch(triviaPda)
        },
        { enabled: !!program },
    )
}
