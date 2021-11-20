import * as anchor from "@project-serum/anchor"
import * as assert from "assert"

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
    const gameKeypair = anchor.web3.Keypair.generate()
    const answerKeypair = anchor.web3.Keypair.generate()

    let game

    it("Creates and initializes a Trivia", async () => {
        await program.rpc.initialize({
            accounts: {
                trivia: triviaKeypair.publicKey,
                authority: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [triviaKeypair]
        })

        await program.account.trivia.fetch(triviaKeypair.publicKey)
    })

    it("Creates and initializes a Game for the Trivia", async () => {
        const question = {
            question: sha256("What is the best blockchain?"),
            variants: [
                sha256("What is the best blockchain?", "Ethereum"),
                sha256("What is the best blockchain?", "Solana"),
                sha256("What is the best blockchain?", "Bitcoin")
            ],
        }

        await program.rpc.initializeGame(
            "Clever",
            [question],
            {
                accounts: {
                    trivia: triviaKeypair.publicKey,
                    game: gameKeypair.publicKey,
                    authority: provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                },
                signers: [gameKeypair]
            }
        )

        game = await program.account.game.fetch(gameKeypair.publicKey)
        assert.equal(game.name, "Clever")
        assert.deepEqual(game.questions, [question])
        assert.deepEqual(game.revealedQuestions, [])
    })

    it("Starts the Game", async () => {
        await program.rpc.startGame({
            accounts: {
                game: gameKeypair.publicKey,
                authority: provider.wallet.publicKey
            }
        })

        game = await program.account.game.fetch(gameKeypair.publicKey)
        assert.equal(game.started, true)
    })

    it("Reveals a question for the Game", async () => {
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
            revealedQuestion.id,
            revealedQuestion.question,
            revealedQuestion.variants,
            {
                accounts: {
                    game: gameKeypair.publicKey,
                    authority: provider.wallet.publicKey
                }
            }
        )

        game = await program.account.game.fetch(gameKeypair.publicKey)
        assert.deepEqual(
            game.revealedQuestions,
            [{
                question: revealedQuestion.question,
                variants: revealedQuestion.variants,
                votes: []
            }]
        )
    })

    it("Answers the revealed question", async () => {
        await program.rpc.submitAnswer(
            0,
            0,
            {
                accounts: {
                    game: gameKeypair.publicKey,
                    answer: answerKeypair.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                },
                signers: [answerKeypair]
            }
        )

        let answer = await program.account.answer.fetch(answerKeypair.publicKey)
        assert.deepEqual(answer.game, gameKeypair.publicKey)
        assert.equal(answer.questionId, 0)
        assert.equal(answer.variantId, 0)

        game = await program.account.game.fetch(gameKeypair.publicKey)
        assert.deepEqual(
            game.revealedQuestions[0].votes,
            [answerKeypair.publicKey]
        )
    })
})
