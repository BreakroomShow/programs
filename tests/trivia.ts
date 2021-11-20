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
    const questionKeypair = anchor.web3.Keypair.generate()
    const dummyQuestionKeypair = anchor.web3.Keypair.generate()
    const answerKeypair = anchor.web3.Keypair.generate()

    it("Initializes a Trivia", async () => {
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

    it("Creates a Game for the Trivia", async () => {
        await program.rpc.createGame(
            "Clever",
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

        const game = await program.account.game.fetch(gameKeypair.publicKey)
        assert.equal(game.started, false)
        assert.equal(game.name, "Clever")
        assert.deepEqual(game.questions, [])
        assert.equal(game.revealedQuestionsCounter, 0)
    })

    it("Adds a Question for the Game", async () => {
        const name = sha256("What is the best blockchain?")
        const variants = [
            sha256("What is the best blockchain?", "Ethereum"),
            sha256("What is the best blockchain?", "Solana"),
            sha256("What is the best blockchain?", "Bitcoin")
        ]
        const time = 10 * 60; // 10 minutes

        await program.rpc.addQuestion(
            name,
            variants,
            new anchor.BN(time),
            {
                accounts: {
                    game: gameKeypair.publicKey,
                    question: questionKeypair.publicKey,
                    authority: provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                },
                signers: [questionKeypair]
            }
        )
        await program.rpc.addQuestion(
            name,
            variants,
            new anchor.BN(time),
            {
                accounts: {
                    game: gameKeypair.publicKey,
                    question: dummyQuestionKeypair.publicKey,
                    authority: provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                },
                signers: [dummyQuestionKeypair]
            }
        )

        const game = await program.account.game.fetch(gameKeypair.publicKey)
        assert.deepEqual(game.questions, [questionKeypair.publicKey, dummyQuestionKeypair.publicKey])

        const question = await program.account.question.fetch(questionKeypair.publicKey)
        assert.deepEqual(question.game, gameKeypair.publicKey)
        assert.deepEqual(question.question, name)
        assert.deepEqual(question.variants, variants)
        assert.equal(question.time, time)
        assert.equal(question.revealedQuestion, null)
        assert.equal(question.reveleadVariants, null)
        assert.equal(question.deadline, null)
        assert.deepEqual(question.votes, [])
    })

    it("Removes the Question from the Game", async () => {
        await program.rpc.removeQuestion(
            dummyQuestionKeypair.publicKey,
            {
                accounts: {
                    game: gameKeypair.publicKey,
                    authority: provider.wallet.publicKey
                }
            }
        )

        const game = await program.account.game.fetch(gameKeypair.publicKey)
        assert.deepEqual(game.questions, [questionKeypair.publicKey])
    })

    it("Starts the Game", async () => {
        await program.rpc.startGame({
            accounts: {
                game: gameKeypair.publicKey,
                authority: provider.wallet.publicKey
            }
        })

        const game = await program.account.game.fetch(gameKeypair.publicKey)
        assert.equal(game.started, true)
    })

    it("Reveals a question for the Game", async () => {
        const name = "What is the best blockchain?"
        const variants = [
            "Ethereum",
            "Solana",
            "Bitcoin"
        ]

        await program.rpc.revealQuestion(
            name,
            variants,
            {
                accounts: {
                    question: questionKeypair.publicKey,
                    game: gameKeypair.publicKey,
                    authority: provider.wallet.publicKey
                }
            }
        )

        const game = await program.account.game.fetch(gameKeypair.publicKey)
        assert.equal(game.revealedQuestionsCounter, 1)

        const question = await program.account.question.fetch(questionKeypair.publicKey)
        assert.equal(question.revealedQuestion, name)
        assert.deepEqual(question.revealedVariants, variants)
        assert.notEqual(question.deadline, null)
        assert.ok(question.deadline.toNumber() < Date.now() / 1000 + question.time.toNumber())
    })

    it("Answers the revealed question", async () => {
        await program.rpc.submitAnswer(
            1,
            {
                accounts: {
                    question: questionKeypair.publicKey,
                    game: gameKeypair.publicKey,
                    answer: answerKeypair.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                },
                signers: [answerKeypair]
            }
        )

        const answer = await program.account.answer.fetch(answerKeypair.publicKey)
        assert.deepEqual(answer.question, questionKeypair.publicKey)
        assert.equal(answer.variantId, 1)

        const question = await program.account.question.fetch(questionKeypair.publicKey)
        assert.deepEqual(
            question.votes,
            [answerKeypair.publicKey]
        )
    })
})
