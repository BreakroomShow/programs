import * as anchor from "@project-serum/anchor"
import {assert} from "chai"

function sha256(...values: string[]) {
    const sha256 = require("js-sha256")
    const encoder = new TextEncoder()

    return [...values.reduce(
        (previousValue, currentValue) =>
            Buffer.from(sha256([...previousValue, ...encoder.encode(currentValue)]), "hex"),
        Buffer.from([])
    )]
}

describe("trivia", () => {
    const provider = anchor.Provider.local()
    anchor.setProvider(provider)

    const program = anchor.workspace.Trivia
    const triviaKeypair = anchor.web3.Keypair.generate()
    let trivia

    it("Creates and initializes a Trivia", async () => {
        await program.rpc.initialize({
            accounts: {
                trivia: triviaKeypair.publicKey,
                authority: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [triviaKeypair]
        })

        trivia = await program.account.trivia.fetch(triviaKeypair.publicKey)
        assert.equal(trivia.games.length, 0)
    })

    it("Creates a game for Trivia", async () => {
        const question = {
            question: sha256("What is the best blockchain?"),
            revealedQuestion: null,
            variants: [
                sha256("What is the best blockchain?", "Ethereum"),
                sha256("What is the best blockchain?", "Solana"),
                sha256("What is the best blockchain?", "Bitcoin")
            ],
            revealedVariants: null,
        }

        await program.rpc.createGame(
            "Clever",
            [question],
            {
                accounts: {
                    trivia: triviaKeypair.publicKey,
                    authority: provider.wallet.publicKey
                }
            }
        )

        trivia = await program.account.trivia.fetch(triviaKeypair.publicKey)
        assert.deepEqual(
            trivia.games,
            [{
                id: 0,
                name: "Clever",
                questions: [question],
                revealedQuestions: []
            }]
        )
    })

    it("Reveals a question for Trivia", async () => {
        const revealedQuestion = {
            id: 0,
            question: "What is the best blockchain?",
            variants: [
                "Ethereum",
                "Solana",
                "Bitcoin"
            ]
        }

        await program.rpc.revealQuestion(
            0,
            revealedQuestion.id,
            revealedQuestion.question,
            revealedQuestion.variants,
            {
                accounts: {
                    trivia: triviaKeypair.publicKey,
                    authority: provider.wallet.publicKey
                }
            }
        )

        trivia = await program.account.trivia.fetch(triviaKeypair.publicKey)
        assert.deepEqual(
            trivia.games[0].revealedQuestions,
            [{
                question: revealedQuestion.question,
                variants: revealedQuestion.variants
            }]
        )
    })
})
