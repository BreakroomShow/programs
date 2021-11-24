import * as anchor from '@project-serum/anchor'
import {RevealAnswerEvent, RevealQuestionEvent, StartGameEvent} from '../types/event'
import {Answer, Game, Player, Question} from '../types/data'
import {promiseWithTimeout, sha256} from './utils'
import {AnswerPDA, PlayerPDA, TriviaPDA} from '../types/seed'

describe('trivia', () => {
    const provider = anchor.Provider.local()
    anchor.setProvider(provider)

    const program = anchor.workspace.Trivia
    const gameKeypair = anchor.web3.Keypair.generate()
    const questionKeypair = anchor.web3.Keypair.generate()
    const dummyQuestionKeypair = anchor.web3.Keypair.generate()

    let questionDeadline: Date

    test('Initializes a Trivia', async () => {
        const [triviaPDA, triviaBump] = await TriviaPDA(program)

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

    test('Creates a Game for the Trivia', async () => {
        const [triviaPDA] = await TriviaPDA(program)

        await program.rpc.createGame(
            'Clever',
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
        expect(game.started).toBe(false)
        expect(game.name).toBe('Clever')
        expect(game.questions).toStrictEqual([])
        expect(game.revealedQuestionsCounter).toBe(0)
    })

    test('Adds a Question for the Game', async () => {
        const name = sha256('What is the best blockchain?')
        const variants = [
            sha256('What is the best blockchain?', 'Ethereum'),
            sha256('What is the best blockchain?', 'Solana'),
            sha256('What is the best blockchain?', 'Bitcoin')
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
        expect(game.questions).toStrictEqual([questionKeypair.publicKey, dummyQuestionKeypair.publicKey])

        const question: Question = await program.account.question.fetch(questionKeypair.publicKey)
        expect(question.game).toStrictEqual(gameKeypair.publicKey)
        expect(question.question).toStrictEqual(name)
        expect(question.variants).toStrictEqual(variants)
        expect(question.time).toStrictEqual(new anchor.BN(10))
        expect(question.revealedQuestion).toBe(null)
    })

    test('Moves the question in the Game', async () => {
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
        expect(game.questions).toStrictEqual([dummyQuestionKeypair.publicKey, questionKeypair.publicKey])
    })

    test('Removes the Question from the Game', async () => {
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
        expect(game.questions).toStrictEqual([questionKeypair.publicKey])
    })

    test('Whitelists the Player', async () => {
        const [triviaPDA] = await TriviaPDA(program)
        const [whitelistedPlayerPDA, whitelistedPlayerBump] = await PlayerPDA(
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

        await expect(program.rpc.whitelistPlayer(
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
        )).rejects.toThrow(anchor.web3.SendTransactionError)

        const game: Game = await program.account.game.fetch(gameKeypair.publicKey)
        expect(game.questions).toStrictEqual([questionKeypair.publicKey])
    })

    test('Fails to invite the Player because no invites left', async () => {
        const [triviaPDA] = await TriviaPDA(program)
        const [playerPDA] = await PlayerPDA(program, triviaPDA, provider.wallet.publicKey)

        const invitedPlayerKeypair = anchor.web3.Keypair.generate()

        const [invitedPlayerPDA, invitedPlayerBump] = await PlayerPDA(program, triviaPDA, invitedPlayerKeypair.publicKey)

        await expect(program.rpc.invitePlayer(
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
        )).rejects.toThrow(new anchor.ProgramError(
            303,
            'Not enough invites left.',
            '303: Not enough invites left.'
        ))
    })

    test('Adds an invite to the Player', async () => {
        const [triviaPDA] = await TriviaPDA(program)
        const [playerPDA] = await PlayerPDA(program, triviaPDA, provider.wallet.publicKey)

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
        expect(player.leftInvitesCounter).toBe(1)
    })

    test('Invites the Player', async () => {
        const [triviaPDA] = await TriviaPDA(program)
        const [playerPDA] = await PlayerPDA(program, triviaPDA, provider.wallet.publicKey)

        const invitedPlayerKeypair = anchor.web3.Keypair.generate()

        const [invitedPlayerPDA, invitedPlayerBump] = await PlayerPDA(
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
        expect(player.leftInvitesCounter).toBe(0)
    })

    test('Starts the Game', async () => {
        const event: StartGameEvent = await promiseWithTimeout(new Promise(async resolve => {
            const listener = program.addEventListener('StartGameEvent', async event => {
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

        expect(event.game).toStrictEqual(gameKeypair.publicKey)

        const game: Game = await program.account.game.fetch(gameKeypair.publicKey)
        expect(game.started).toBe(true)
    })

    test('Reveals a Question for the Game', async () => {
        const name = 'What is the best blockchain?'
        const variants = [
            'Ethereum',
            'Solana',
            'Bitcoin'
        ]

        const event: RevealQuestionEvent = await promiseWithTimeout(new Promise(async resolve => {
            const listener = program.addEventListener('RevealQuestionEvent', async event => {
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

        expect(event.game).toStrictEqual(gameKeypair.publicKey)
        expect(event.question).toStrictEqual(questionKeypair.publicKey)

        const game: Game = await program.account.game.fetch(gameKeypair.publicKey)
        expect(game.revealedQuestionsCounter).toBe(1)

        const question: Question = await program.account.question.fetch(questionKeypair.publicKey)
        expect(question.revealedQuestion.question).toBe(name)
        expect(question.revealedQuestion.variants).toStrictEqual(variants)
        expect(question.revealedQuestion.deadline).not.toBeNull()
        expect(question.revealedQuestion.deadline.toNumber() < Date.now() / 1000 + question.time.toNumber()).toBeTruthy()
        expect(question.revealedQuestion.answers).toStrictEqual([[], [], []])

        questionDeadline = new Date(question.revealedQuestion.deadline.toNumber() * 1000)
    })

    test('Submits an Answer for the revealed Question', async () => {
        const [triviaPDA] = await TriviaPDA(program)
        const [playerPDA] = await PlayerPDA(program, triviaPDA, provider.wallet.publicKey)
        const [answerPDA, answerBump] = await AnswerPDA(
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
        expect(answer.question).toStrictEqual(questionKeypair.publicKey)
        expect(answer.variantId).toBe(1)

        const question: Question = await program.account.question.fetch(questionKeypair.publicKey)
        expect(question.revealedQuestion.answers).toStrictEqual([[], [answerPDA], []])

        const player: Player = await program.account.player.fetch(playerPDA)
        expect(player.finishedGamesCounter).toBe(1)
    })

    test('Reveals an Answer for the finished Question', async () => {
        await new Promise(resolve =>
            setTimeout(resolve, Math.ceil((questionDeadline.getTime() - new Date().getTime()) / 1000 + 2) * 1000))

        const event: RevealAnswerEvent = await promiseWithTimeout(new Promise(async resolve => {
            const listener = program.addEventListener('RevealAnswerEvent', async event => {
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

        expect(event.game).toStrictEqual(gameKeypair.publicKey)
        expect(event.question).toStrictEqual(questionKeypair.publicKey)

        const question: Question = await program.account.question.fetch(questionKeypair.publicKey)
        expect(question.revealedQuestion.answerVariantId).toBe(2)
    })
})
