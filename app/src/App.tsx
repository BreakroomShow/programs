import '@solana/wallet-adapter-react-ui/styles.css'

import * as anchor from '@project-serum/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import * as solana from '@solana/web3.js'
import { useEffect, useMemo, useState } from 'react'

import { PdaResult, TriviaPDA } from './api/seed'
import { network, preflightCommitment, programID, triviaIdl } from './config'
import { useGetLatest } from './hooks/useGetLatest'
import { Trivia, TriviaIdl } from './types'

function useProgram() {
    const wallet = useWallet()

    return useMemo(() => {
        const connection = new solana.Connection(network, preflightCommitment)
        const provider = new anchor.Provider(connection, wallet as unknown as anchor.Wallet, { preflightCommitment })
        const program = new anchor.Program<TriviaIdl>(triviaIdl, programID, provider)

        return [program, provider] as const
    }, [wallet])
}

function usePda(init?: () => Promise<PdaResult | null> | null) {
    const [[pda, bump], setPda] = useState<PdaResult | [null, null]>([null, null])

    const getPda = useGetLatest(init || (() => null))

    const set = useGetLatest(async (fnOrResult: PdaResult | null | typeof init) => {
        if (typeof fnOrResult === 'function') {
            try {
                const res = await fnOrResult()
                await set(res)
            } catch {
                setPda([null, null])
            }
            return
        }

        setPda(fnOrResult || [null, null])
    })

    useEffect(() => {
        set(getPda)
    }, [getPda, set])

    return [pda, bump, set] as const
}

function useTriviaPDA() {
    const [triviaPDA] = usePda(() => TriviaPDA(programID))
    return triviaPDA
}

// function usePlayerPDA() {
//     const [playerPDA, , setPlayerPDA] = usePda()
//     const triviaPDA = useTriviaPDA()
//     const [program, provider] = useProgram()
//
//     useEffect(() => {
//         if (!triviaPDA) return
//         if (!provider.wallet.publicKey) return
//
//         setPlayerPDA(() => PlayerPDA(programID, triviaPDA, provider.wallet.publicKey))
//     }, [program.account.trivia, provider.wallet.publicKey, setPlayerPDA, triviaPDA])
//
//     return playerPDA
// }

function useTrivia() {
    const [trivia, setTrivia] = useState<null | Trivia>(null)
    const triviaPda = useTriviaPDA()
    const [program] = useProgram()

    useEffect(() => {
        if (triviaPda) {
            program.account.trivia.fetch(triviaPda).then(setTrivia)
        }
    }, [program.account.trivia, triviaPda])

    return trivia
}

function ConnectedApp() {
    const wallet = useWallet()

    return (
        <div>
            <div>{String(wallet.publicKey)}</div>
            <br />
            <div>
                <button onClick={() => wallet.disconnect()}>disconnect</button>
            </div>
        </div>
    )
}

function DisconnectedApp() {
    return (
        <div>
            <WalletMultiButton />
        </div>
    )
}

export function App() {
    const wallet = useWallet()
    const trivia = useTrivia()

    const connection = (() => {
        if (wallet.connected) return <ConnectedApp />
        if (wallet.connecting) return null
        return <DisconnectedApp />
    })()

    return (
        <div>
            <div>{connection}</div>
            <br />
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(trivia, null, 4)}</div>
        </div>
    )
}
