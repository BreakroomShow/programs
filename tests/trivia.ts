import * as anchor from "@project-serum/anchor"
import * as assert from "assert"
import {RevealAnswerEvent, RevealQuestionEvent, StartGameEvent} from "../types/event"
import {Answer, Game, Player, Question} from "../types/data"
import {promiseWithTimeout} from "./utils"
import {AnswerPDA, PlayerPDA, TriviaPDA} from "../types/seed"

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
    const gameKeypair = anchor.web3.Keypair.generate()
    const questionKeypair = anchor.web3.Keypair.generate()
    const dummyQuestionKeypair = anchor.web3.Keypair.generate()

    let questionDeadline: Date

    it("Initializes a Trivia", async () => {
        let [triviaPDA, triviaBump] = await TriviaPDA(program)

        await program.rpc.initialize(
            triviaBump,
            {
                accounts: {
                    trivia: triviaPDA,
                    authority: provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                }
            }
        )

        await program.account.trivia.fetch(triviaPDA)
    })

    it("Creates a Game for the Trivia", async () => {
        let [triviaPDA, triviaBump] = await TriviaPDA(program)

        await program.rpc.createGame(
            "Clever",
            {
                accounts: {
                    trivia: triviaPDA,
                    game: gameKeypair.publicKey,
                    authority: provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                },
                signers: [gameKeypair]
            }
        )

        const game: Game = await program.account.game.fetch(gameKeypair.publicKey)
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
        const time = 10 // 10 seconds

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

        const game: Game = await program.account.game.fetch(gameKeypair.publicKey)
        assert.deepEqual(game.questions, [questionKeypair.publicKey, dummyQuestionKeypair.publicKey])

        const question: Question = await program.account.question.fetch(questionKeypair.publicKey)
        assert.deepEqual(question.game, gameKeypair.publicKey)
        assert.deepEqual(question.question, name)
        assert.deepEqual(question.variants, variants)
        assert.equal(question.time, time)
        assert.equal(question.revealedQuestion, null)
    })

    it("Moves the question in the Game", async () => {
        await program.rpc.moveQuestion(
            dummyQuestionKeypair.publicKey,
            0,
            {
                accounts: {
                    game: gameKeypair.publicKey,
                    authority: provider.wallet.publicKey
                }
            }
        )

        const game: Game = await program.account.game.fetch(gameKeypair.publicKey)
        assert.deepEqual(game.questions, [dummyQuestionKeypair.publicKey, questionKeypair.publicKey])
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

        const game: Game = await program.account.game.fetch(gameKeypair.publicKey)
        assert.deepEqual(game.questions, [questionKeypair.publicKey])
    })

    it("Whitelists the Player", async () => {
        let [triviaPDA, triviaBump] = await TriviaPDA(program)
        let [whitelistedPlayerPDA, whitelistedPlayerBump] = await PlayerPDA(
            program,
            triviaPDA,
            provider.wallet.publicKey
        )

        await program.rpc.whitelistPlayer(
            provider.wallet.publicKey,
            whitelistedPlayerBump,
            {
                accounts: {
                    trivia: triviaPDA,
                    whitelistedPlayer: whitelistedPlayerPDA,
                    authority: provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                }
            }
        )

        // TODO: fix throw assertion and error check
        // try {
        //     await program.rpc.whitelistProfile(
        //         userKeypair.publicKey,
        //         whitelistedProfileBump,
        //         {
        //             accounts: {
        //                 trivia: triviaKeypair.publicKey,
        //                 whitelistedProfile: whitelistedProfile,
        //                 authority: provider.wallet.publicKey,
        //                 systemProgram: anchor.web3.SystemProgram.programId
        //             }
        //         }
        //     )
        // } catch (error) {
        //     assert.equal(error, anchor.web3.SendTransactionError)
        // }

        const game: Game = await program.account.game.fetch(gameKeypair.publicKey)
        assert.deepEqual(game.questions, [questionKeypair.publicKey])
    })

    // TODO: fix throw assertion and error check
    // it("Fails to invite the Player because no invites left", async () => {
    //     let [playerPDA, playerBump] = await anchor.web3.PublicKey.findProgramAddress(
    //         [
    //             Buffer.from(WHITELISTED_PLAYER),
    //             triviaKeypair.publicKey.toBuffer(),
    //             provider.wallet.publicKey.toBuffer()
    //         ],
    //         program.programId
    //     )
    //
    //     const invitedPlayerKeypair = anchor.web3.Keypair.generate()
    //
    //     let [invitedPlayerPDA, invitedPlayerBump] = await anchor.web3.PublicKey.findProgramAddress(
    //         [
    //             Buffer.from(WHITELISTED_PLAYER),
    //             triviaKeypair.publicKey.toBuffer(),
    //             invitedPlayerKeypair.publicKey.toBuffer()
    //         ],
    //         program.programId
    //     )
    //
    //     await program.rpc.invitePlayer(
    //         invitedPlayerKeypair.publicKey,
    //         invitedPlayerBump,
    //         {
    //             accounts: {
    //                 trivia: triviaKeypair.publicKey,
    //                 invitedPlayer: invitedPlayerPDA,
    //                 player: playerPDA,
    //                 authority: provider.wallet.publicKey,
    //                 systemProgram: anchor.web3.SystemProgram.programId
    //             }
    //         }
    //     )
    // })

    it("Adds an invite to the Player", async () => {
        let [triviaPDA, triviaBump] = await TriviaPDA(program)
        let [playerPDA, playerBump] = await PlayerPDA(program, triviaPDA, provider.wallet.publicKey)

        await program.rpc.addPlayerInvite(
            {
                accounts: {
                    trivia: triviaPDA,
                    player: playerPDA,
                    authority: provider.wallet.publicKey
                }
            }
        )

        const player: Player = await program.account.player.fetch(playerPDA)
        assert.equal(player.leftInvitesCounter, 1)
    })

    it("Invites the Player", async () => {
        let [triviaPDA, triviaBump] = await TriviaPDA(program)
        let [playerPDA, playerBump] = await PlayerPDA(program, triviaPDA, provider.wallet.publicKey)

        const invitedPlayerKeypair = anchor.web3.Keypair.generate()

        let [invitedPlayerPDA, invitedPlayerBump] = await PlayerPDA(
            program,
            triviaPDA,
            invitedPlayerKeypair.publicKey
        )

        await program.rpc.invitePlayer(
            invitedPlayerKeypair.publicKey,
            invitedPlayerBump,
            {
                accounts: {
                    trivia: triviaPDA,
                    invitedPlayer: invitedPlayerPDA,
                    player: playerPDA,
                    authority: provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                }
            }
        )

        const player: Player = await program.account.player.fetch(playerPDA)
        assert.equal(player.leftInvitesCounter, 0)
    })

    it("Starts the Game", async () => {
        const event: StartGameEvent = await promiseWithTimeout(new Promise(async resolve => {
            const listener = program.addEventListener("StartGameEvent", async event => {
                await program.removeEventListener(listener)
                resolve(event)
            })

            await program.rpc.startGame({
                accounts: {
                    game: gameKeypair.publicKey,
                    authority: provider.wallet.publicKey
                }
            })
        }), 5000)

        assert.deepEqual(event.game, gameKeypair.publicKey)

        const game: Game = await program.account.game.fetch(gameKeypair.publicKey)
        assert.equal(game.started, true)
    })

    it("Reveals a Question for the Game", async () => {
        const name = "What is the best blockchain?"
        const variants = [
            "Ethereum",
            "Solana",
            "Bitcoin"
        ]

        const event: RevealQuestionEvent = await promiseWithTimeout(new Promise(async resolve => {
            const listener = program.addEventListener("RevealQuestionEvent", async event => {
                await program.removeEventListener(listener)
                resolve(event)
            })

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
        }), 5000)

        assert.deepEqual(event.game, gameKeypair.publicKey)
        assert.deepEqual(event.question, questionKeypair.publicKey)

        const game: Game = await program.account.game.fetch(gameKeypair.publicKey)
        assert.equal(game.revealedQuestionsCounter, 1)

        const question: Question = await program.account.question.fetch(questionKeypair.publicKey)
        assert.equal(question.revealedQuestion.question, name)
        assert.deepEqual(question.revealedQuestion.variants, variants)
        assert.notEqual(question.revealedQuestion.deadline, null)
        assert.ok(question.revealedQuestion.deadline.toNumber() < Date.now() / 1000 + question.time.toNumber())
        assert.deepEqual(question.revealedQuestion.answers, [[], [], []])

        questionDeadline = new Date(question.revealedQuestion.deadline.toNumber() * 1000)
    })

    it("Submits an Answer for the revealed Question", async () => {
        let [triviaPDA, triviaBump] = await TriviaPDA(program)
        let [playerPDA, playerBump] = await PlayerPDA(program, triviaPDA, provider.wallet.publicKey)
        let [answerPDA, answerBump] = await AnswerPDA(
            program,
            triviaPDA,
            gameKeypair.publicKey,
            questionKeypair.publicKey,
            playerPDA
        )

        await program.rpc.submitAnswer(
            1,
            answerBump,
            {
                accounts: {
                    trivia: triviaPDA,
                    game: gameKeypair.publicKey,
                    question: questionKeypair.publicKey,
                    answer: answerPDA,
                    player: playerPDA,
                    authority: provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                }
            }
        )

        const answer: Answer = await program.account.answer.fetch(answerPDA)
        assert.deepEqual(answer.question, questionKeypair.publicKey)
        assert.equal(answer.variantId, 1)

        const question: Question = await program.account.question.fetch(questionKeypair.publicKey)
        assert.deepEqual(
            question.revealedQuestion.answers,
            [[], [answerPDA], []]
        )

        const player: Player = await program.account.player.fetch(playerPDA)
        assert.equal(player.finishedGamesCounter, 1)
    })

    it("Reveals an Answer for the finished Question", async () => {
        await new Promise(resolve =>
            setTimeout(resolve, Math.ceil((questionDeadline.getTime() - new Date().getTime()) / 1000 + 2) * 1000))

        const event: RevealAnswerEvent = await promiseWithTimeout(new Promise(async resolve => {
            const listener = program.addEventListener("RevealAnswerEvent", async event => {
                await program.removeEventListener(listener)
                resolve(event)
            })

            await program.rpc.revealAnswer(
                2,
                {
                    accounts: {
                        question: questionKeypair.publicKey,
                        game: gameKeypair.publicKey,
                        authority: provider.wallet.publicKey
                    }
                }
            )
        }), 5000)

        assert.deepEqual(event.game, gameKeypair.publicKey)
        assert.deepEqual(event.question, questionKeypair.publicKey)

        const question: Question = await program.account.question.fetch(questionKeypair.publicKey)
        assert.equal(question.revealedQuestion.answerVariantId, 2)
    })
})
