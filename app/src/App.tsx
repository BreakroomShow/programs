import '@solana/wallet-adapter-react-ui/styles.css'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import { useCreateGame } from './api/mutations'
import { useGameQuery, useTriviaQuery } from './api/query'

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

function Connection() {
    const wallet = useWallet()
    if (wallet.connected) return <ConnectedApp />
    if (wallet.connecting) return null
    return <DisconnectedApp />
}

function renderObject(object: object | null = null) {
    return <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(object, null, 4)}</div>
}

export function App() {
    const wallet = useWallet()

    const { data: trivia, status: triviaStatus } = useTriviaQuery()

    const gameIds = Array.from(Array(trivia?.gamesCounter).keys())
    const lastGameId = gameIds[gameIds.length - 1]

    const { data: lastGame, status: lastGameStatus } = useGameQuery(lastGameId)

    const createGameMutation = useCreateGame(trivia?.gamesCounter || 0)

    function createGame() {
        createGameMutation.mutate({
            name: 'brand new game',
            startTime: Math.floor(new Date().getTime() / 1000) + 60,
        })
    }

    return (
        <div>
            <Connection />
            <br />
            <div>all game ids: {gameIds.length ? gameIds.join(', ') : 'no games'}</div>
            <br />
            <div>
                lastGame: {lastGameStatus} {renderObject(lastGame)}
            </div>
            <br />
            <div>
                trivia: {triviaStatus} {renderObject(trivia)}
            </div>
            <br />
            {wallet.connected ? (
                <div>
                    <button onClick={createGame}>create game</button>
                </div>
            ) : null}
        </div>
    )
}
