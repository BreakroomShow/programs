import * as anchor from '@project-serum/anchor'
import {Keypair, PublicKey, sendAndConfirmRawTransaction, LAMPORTS_PER_SOL} from "@solana/web3.js"

import {
    CreateGameOptions,
    EditGameEvent,
    EditGameOptions,
    Game,
    GamePDA,
    PlayerPDA,
    RevealAnswerEvent,
    RevealQuestionEvent, Trivia,
    TriviaPDA,
    TriviaProgram,
    UserPDA
} from '../types'
import {promiseWithTimeout, sha256} from './utils'

describe('trivia', () => {
    const provider = anchor.Provider.local()
    anchor.setProvider(provider)

    const program: TriviaProgram = anchor.workspace.Trivia
    const programId = program.programId

    let triviaPDA: PublicKey
    let gamePDA: PublicKey
    let userPDA: PublicKey

    const questionKeypair = Keypair.generate()
    const dummyQuestionKeypair = Keypair.generate()

    const player1Keypair = Keypair.generate()
    let player1UserPDA: PublicKey
    let player1PlayerPDA: PublicKey

    const player2Keypair = Keypair.generate()
    let player2UserPDA: PublicKey
    let player2PlayerPDA: PublicKey

    // We'll pay for transactions of some users, acting as a fee payer for transaction.
    // For player 2 we won't airdrop any SOL and have fee payer pay for both transaction and rent fees.
    // However, player 2 should remain the custodial owner of all game accounts
    const feePayerKeypair = Keypair.generate()

    let questionDeadline: Date

    beforeAll(async () => {
        // Airdrop some funds on player and fee payer keypairs:
        for (const publicKey of [player1Keypair.publicKey, feePayerKeypair.publicKey]) {
            const airdropSignature = await provider.connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
            await provider.connection.confirmTransaction(airdropSignature);
        }
    })

    test('Initializes a Trivia', async () => {
        const [_triviaPDA, triviaBump] = await TriviaPDA(programId)
        triviaPDA = _triviaPDA

        await program.rpc.initialize(triviaBump, {
            accounts: {
                trivia: triviaPDA,
                authority: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
        })

        await program.account.trivia.fetch(triviaPDA)
    })

    test('Creates a Game for the Trivia', async () => {
        const [_gamePDA, gameBump] = await GamePDA(
            programId,
            triviaPDA,
            (
                await program.account.trivia.fetch(triviaPDA)
            ).gamesCounter,
        )
        gamePDA = _gamePDA

        const options: CreateGameOptions = {
            name: 'Clever',
            startTime: new anchor.BN(Math.floor(new Date().getTime() / 1000) + 60),
        }

        await program.rpc.createGame(options, gameBump, {
            accounts: {
                trivia: triviaPDA,
                game: gamePDA,
                authority: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
        })

        const trivia = await program.account.trivia.fetch(triviaPDA)
        expect(trivia.gamesCounter).toBe(1)

        const game = await program.account.game.fetch(gamePDA)
        expect(game.name).toBe(options.name)
        expect(game.startTime.toNumber()).toBe(options.startTime.toNumber())
        expect(game.questionKeys).toStrictEqual([])
        expect(game.revealedQuestionsCounter).toBe(0)
    })

    test('Edits the Game', async () => {
        const options: EditGameOptions = {
            name: 'CryptoClever',
            startTime: new anchor.BN(Math.floor(new Date().getTime() / 1000) + 10 * 60),
        }

        const event = await promiseWithTimeout(
            new Promise<EditGameEvent>(async (resolve) => {
                const listener = program.addEventListener('EditGameEvent', async (event) => {
                    await program.removeEventListener(listener)
                    resolve(event)
                })

                await program.rpc.editGame(options, {
                    accounts: {
                        game: gamePDA,
                        authority: provider.wallet.publicKey,
                    },
                })
            }),
            5000,
        )

        expect(event.game).toStrictEqual(gamePDA)

        const game = await program.account.game.fetch(gamePDA)
        expect(game.name).toBe(options.name)
        expect(game.startTime.toNumber()).toBe(options.startTime.toNumber())
    })

    test('Adds a Question for the Game', async () => {
        const name = sha256('What is the best blockchain?')
        const variants = [
            sha256('What is the best blockchain?', 'Ethereum'),
            sha256('What is the best blockchain?', 'Solana'),
            sha256('What is the best blockchain?', 'Bitcoin'),
        ]
        const time = 10 // 10 seconds

        await program.rpc.addQuestion(name, variants, new anchor.BN(time), {
            accounts: {
                game: gamePDA,
                question: questionKeypair.publicKey,
                authority: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [questionKeypair],
        })
        await program.rpc.addQuestion(name, variants, new anchor.BN(time), {
            accounts: {
                game: gamePDA,
                question: dummyQuestionKeypair.publicKey,
                authority: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [dummyQuestionKeypair],
        })

        const game = await program.account.game.fetch(gamePDA)
        expect(game.questionKeys).toStrictEqual([questionKeypair.publicKey, dummyQuestionKeypair.publicKey])

        const question = await program.account.question.fetch(questionKeypair.publicKey)
        expect(question.game).toStrictEqual(gamePDA)
        expect(question.question).toStrictEqual(name)
        expect(question.variants).toStrictEqual(variants)
        expect(question.time.toNumber()).toStrictEqual(10)
        expect(question.revealedQuestion).toBe(null)
    })

    test('Moves the Question in the Game', async () => {
        await program.rpc.moveQuestion(dummyQuestionKeypair.publicKey, 0, {
            accounts: {
                game: gamePDA,
                authority: provider.wallet.publicKey,
            },
        })

        const game = await program.account.game.fetch(gamePDA)
        expect(game.questionKeys).toStrictEqual([dummyQuestionKeypair.publicKey, questionKeypair.publicKey])
    })

    test('Removes the Question from the Game', async () => {
        await program.rpc.removeQuestion(dummyQuestionKeypair.publicKey, {
            accounts: {
                game: gamePDA,
                authority: provider.wallet.publicKey,
            },
        })

        const game = await program.account.game.fetch(gamePDA)
        expect(game.questionKeys).toStrictEqual([questionKeypair.publicKey])
    })

    test('Whitelists the User', async () => {
        const [_userPDA, userBump] = await UserPDA(
            programId,
            triviaPDA,
            provider.wallet.publicKey
        )
        userPDA = _userPDA

        await program.rpc.whitelistUser(
            provider.wallet.publicKey,
            userBump,
            {
                accounts: {
                    trivia: triviaPDA,
                    whitelistedUser: userPDA,
                    authority: provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                }
            }
        )

        await expect(
            program.rpc.whitelistUser(provider.wallet.publicKey, userBump, {
                accounts: {
                    trivia: triviaPDA,
                    whitelistedUser: userPDA,
                    authority: provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                },
            }),
        ).rejects.toThrow(anchor.web3.SendTransactionError)

        const game = await program.account.game.fetch(gamePDA)
        expect(game.questionKeys).toStrictEqual([questionKeypair.publicKey])
    })

    test('Fails to invite the User because no invites left', async () => {
        const invitedUserKeypair = Keypair.generate()

        const [invitedUserPDA, invitedUserBump] = await UserPDA(
            programId,
            triviaPDA,
            invitedUserKeypair.publicKey,
        )

        await expect(
            program.rpc.inviteUser(invitedUserKeypair.publicKey, invitedUserBump, {
                accounts: {
                    trivia: triviaPDA,
                    invitedUser: invitedUserPDA,
                    user: userPDA,
                    authority: provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                },
            }),
        ).rejects.toThrow('failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x12f')
    })

    test('Adds an invite to the User', async () => {
        await program.rpc.addUserInvite({
            accounts: {
                trivia: triviaPDA,
                user: userPDA,
                authority: provider.wallet.publicKey,
            },
        })

        const user = await program.account.user.fetch(userPDA)
        expect(user.leftInvitesCounter).toBe(1)
    })

    test('Invites the User', async () => {
        const invitedUserKeypair = Keypair.generate()

        const [invitedUserPDA, invitedUserBump] = await UserPDA(
            programId,
            triviaPDA,
            invitedUserKeypair.publicKey,
        )

        await program.rpc.inviteUser(invitedUserKeypair.publicKey, invitedUserBump, {
            accounts: {
                trivia: triviaPDA,
                invitedUser: invitedUserPDA,
                user: userPDA,
                authority: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
        })

        const user = await program.account.user.fetch(userPDA)
        expect(user.leftInvitesCounter).toBe(0)
    })

    test('Starts the Game', async () => {
        const event = await promiseWithTimeout(
            new Promise<EditGameEvent>(async (resolve) => {
                const listener = program.addEventListener('EditGameEvent', async (event) => {
                    await program.removeEventListener(listener)
                    resolve(event)
                })

                await program.rpc.startGame({
                    accounts: {
                        game: gamePDA,
                        authority: provider.wallet.publicKey,
                    },
                })
            }),
            5000,
        )

        expect(event.game).toStrictEqual(gamePDA)

        const game = await program.account.game.fetch(gamePDA)
        expect(game.startTime.toNumber()).toBeLessThan(new Date().getTime() / 1000)
    })

    test('Fails to edit the already started Game', async () => {
        const options: EditGameOptions = {
            name: 'CryptoClever',
            startTime: new anchor.BN(Math.floor(new Date().getTime() / 1000) + 10 * 60),
        }

        await expect(program.rpc.editGame(options, {
            accounts: {
                game: gamePDA,
                authority: provider.wallet.publicKey,
            },
        })).rejects.toThrow('failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x132')
    })

    test('Fails to move the Question in the already started Game', async () => {
        await expect(program.rpc.moveQuestion(dummyQuestionKeypair.publicKey, 0, {
            accounts: {
                game: gamePDA,
                authority: provider.wallet.publicKey,
            },
        })).rejects.toThrow('failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x132')
    })

    test('Fails to remove the Question from the already started Game', async () => {
        await expect(program.rpc.removeQuestion(dummyQuestionKeypair.publicKey, {
            accounts: {
                game: gamePDA,
                authority: provider.wallet.publicKey,
            },
        })).rejects.toThrow('failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x132')
    })

    test('Reveals a Question for the Game', async () => {
        const name = 'What is the best blockchain?'
        const variants = ['Ethereum', 'Solana', 'Bitcoin']

        const event = await promiseWithTimeout(
            new Promise<RevealQuestionEvent>(async (resolve) => {
                const listener = program.addEventListener('RevealQuestionEvent', async (event) => {
                    await program.removeEventListener(listener)
                    resolve(event)
                })

                await program.rpc.revealQuestion(name, variants, {
                    accounts: {
                        question: questionKeypair.publicKey,
                        game: gamePDA,
                        authority: provider.wallet.publicKey,
                    },
                })
            }),
            5000,
        )

        expect(event.game).toStrictEqual(gamePDA)
        expect(event.question).toStrictEqual(questionKeypair.publicKey)

        const game = await program.account.game.fetch(gamePDA)
        expect(game.revealedQuestionsCounter).toBe(1)

        const question = await program.account.question.fetch(questionKeypair.publicKey)
        expect(question.revealedQuestion.question).toBe(name)
        expect(question.revealedQuestion.variants).toStrictEqual(variants)
        expect(question.revealedQuestion.deadline).not.toBeNull()
        expect(
            question.revealedQuestion.deadline.toNumber() < Date.now() / 1000 + question.time.toNumber(),
        ).toBeTruthy()

        questionDeadline = new Date(question.revealedQuestion.deadline.toNumber() * 1000)
    })

    test('Submits an Answer for the revealed Question', async () => {
        const [userPDA, userBump] = await UserPDA(programId, triviaPDA, provider.wallet.publicKey)
        const [playerPDA, playerBump] = await PlayerPDA(programId, gamePDA, userPDA)

        await program.rpc.submitAnswer(1, playerBump, userBump, {
            accounts: {
                trivia: triviaPDA,
                game: gamePDA,
                user: userPDA,
                player: playerPDA,
                question: questionKeypair.publicKey,
                authority: provider.wallet.publicKey,
                feePayer: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
        })

        const user = await program.account.user.fetch(userPDA)
        expect(user.finishedGamesCounter).toBe(1)
        expect(user.leftInvitesCounter).toBe(3)

        const player = await program.account.player.fetch(playerPDA)
        expect(player.answers).toStrictEqual([1])
    })

    // todo: probably, get rid of whilelists/invites

    test('Submits an Answer from a Player 1', async () => {
        const [_userPDA, userBump] = await UserPDA(programId, triviaPDA, player1Keypair.publicKey)
        player1UserPDA = _userPDA
        const [_playerPDA, playerBump] = await PlayerPDA(programId, gamePDA, player1UserPDA)
        player1PlayerPDA = _playerPDA

        const transaction = program.transaction.submitAnswer(
          2, playerBump, userBump, {
              accounts: {
                  trivia: triviaPDA,
                  game: gamePDA,
                  user: player1UserPDA,
                  player: player1PlayerPDA,
                  question: questionKeypair.publicKey,
                  authority: player1Keypair.publicKey,
                  feePayer: player1Keypair.publicKey,
                  systemProgram: anchor.web3.SystemProgram.programId,
              }
          }
        )

        transaction.feePayer = player1Keypair.publicKey
        transaction.recentBlockhash = (
          await provider.connection.getRecentBlockhash('confirmed')
        ).blockhash

        transaction.sign(player1Keypair)

        await sendAndConfirmRawTransaction(
          provider.connection,
          transaction.serialize(),
          {skipPreflight: true}
        );

        const player = await program.account.player.fetch(player1PlayerPDA)
        expect(player.answers).toStrictEqual([2])
    })

    test('Submits an Answer from a Player 2', async () => {
        const [_userPDA, userBump] = await UserPDA(programId, triviaPDA, player2Keypair.publicKey)
        player2UserPDA = _userPDA
        const [_playerPDA, playerBump] = await PlayerPDA(programId, gamePDA, player2UserPDA)
        player2PlayerPDA = _playerPDA

        const transaction = program.transaction.submitAnswer(
          1, playerBump, userBump, {
              accounts: {
                  trivia: triviaPDA,
                  game: gamePDA,
                  user: player2UserPDA,
                  player: player2PlayerPDA,
                  question: questionKeypair.publicKey,
                  authority: player2Keypair.publicKey,
                  feePayer: feePayerKeypair.publicKey,
                  systemProgram: anchor.web3.SystemProgram.programId,
              }
          }
        )

        transaction.feePayer = feePayerKeypair.publicKey
        transaction.recentBlockhash = (await provider.connection.getRecentBlockhash('confirmed')).blockhash

        transaction.partialSign(feePayerKeypair, player2Keypair)

        await sendAndConfirmRawTransaction(
          provider.connection,
          transaction.serialize(),
          {skipPreflight: true}
        );

        const player = await program.account.player.fetch(player2PlayerPDA)
        expect(player.answers).toStrictEqual([1])
    })

    test('Reveals an Answer for the finished Question', async () => {
        await new Promise((resolve) =>
            setTimeout(resolve, Math.ceil((questionDeadline.getTime() - new Date().getTime()) / 1000 + 2) * 1000),
        )

        const event = await promiseWithTimeout(
            new Promise<RevealAnswerEvent>(async (resolve) => {
                const listener = program.addEventListener('RevealAnswerEvent', async (event) => {
                    await program.removeEventListener(listener)
                    resolve(event)
                })

                await program.rpc.revealAnswer(2, {
                    accounts: {
                        question: questionKeypair.publicKey,
                        game: gamePDA,
                        authority: provider.wallet.publicKey,
                    },
                })
            }),
            5000,
        )

        expect(event.game).toStrictEqual(gamePDA)
        expect(event.question).toStrictEqual(questionKeypair.publicKey)

        const game = await program.account.game.fetch(gamePDA)
        expect(game.correctAnswers).toStrictEqual([2])

        const question = await program.account.question.fetch(questionKeypair.publicKey)
        expect(question.revealedQuestion.answerVariantId).toBe(2)
    })

    test('Fails to reveal an Answer for the finished Question', async () => {
        await expect(program.rpc.revealAnswer(1, {
            accounts: {
                question: questionKeypair.publicKey,
                game: gamePDA,
                authority: provider.wallet.publicKey,
            },
        })).rejects.toThrow('failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x13e')
    })

    test('Starts Win Claiming For the Game', async () => {
        const game1 = await program.account.game.fetch(gamePDA)
        expect(game1.winClaimingStatus).toStrictEqual({'notStarted': {}})

        await new Promise((resolve) =>
          setTimeout(resolve, Math.ceil((questionDeadline.getTime() - new Date().getTime()) / 1000 + 2) * 1000),
        )

        const event = await promiseWithTimeout(
          new Promise<RevealAnswerEvent>(async (resolve) => {
              const listener = program.addEventListener('WinClaimingStartedEvent', async (event) => {
                  await program.removeEventListener(listener)
                  resolve(event)
              })

              await program.rpc.startWinClaiming({
                  accounts: {
                      game: gamePDA,
                      authority: provider.wallet.publicKey,
                  },
              })
          }),
          5000,
        )

        expect(event.game).toStrictEqual(gamePDA)

        const game2 = await program.account.game.fetch(gamePDA)
        expect(game2.winClaimingStatus).toStrictEqual({'active': {}})
    })

    test('Player 1 claims the win and succeeds', async () => {
        const game1 = await program.account.game.fetch(gamePDA)
        expect(game1.winners).toStrictEqual(0)

        const transaction = program.transaction.claimWin( {
            accounts: {
                trivia: triviaPDA,
                game: gamePDA,
                user: player1UserPDA,
                player: player1PlayerPDA,
                authority: player1Keypair.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            }
        })

        transaction.feePayer = player1Keypair.publicKey
        transaction.recentBlockhash = (await provider.connection.getRecentBlockhash('confirmed')).blockhash

        transaction.sign(player1Keypair)

        await sendAndConfirmRawTransaction(
          provider.connection,
          transaction.serialize(),
          {skipPreflight: true}
        )

        const game2 = await program.account.game.fetch(gamePDA)
        expect(game2.winners).toStrictEqual(1)

        const player = await program.account.player.fetch(player1PlayerPDA)
        expect(player.claimedWin).toStrictEqual(true)
    })

    test('Returns all the data', async () => {
        let trivia = await program.account.trivia.fetch(triviaPDA)
        trivia = Object.assign(trivia, {
            games: await Promise.all(
                [...Array(trivia.gamesCounter).keys()].map(async (gameId) => {
                    const [gamePDA] = await GamePDA(programId, triviaPDA, gameId)
                    const game = (await program.account.game.fetch(gamePDA)) as Game

                    return Object.assign(game, {
                        questions: await Promise.all(
                            game.questionKeys.map(async (questionKey) => {
                                return await program.account.question.fetch(questionKey)
                            }),
                        ),
                    })
                }),
            ),
        })

        const user = await program.account.user.fetch(userPDA)

        console.log(JSON.stringify(trivia))
        console.log(JSON.stringify(user))
    })
})
