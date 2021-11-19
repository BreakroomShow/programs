const anchor = require("@project-serum/anchor");
const assert = require("assert");

function sha256(...values) {
    const sha256 = require('js-sha256');
    const encoder = new TextEncoder();

    return [...values.reduce(
        (previousValue, currentValue) =>
            Buffer.from(sha256([...previousValue, ...encoder.encode(currentValue)]), 'hex'),
        Buffer.from([])
    )]
}

describe("trivia", () => {
    const provider = anchor.Provider.local();
    anchor.setProvider(provider);

    const program = anchor.workspace.Trivia;
    const triviaKeypair = anchor.web3.Keypair.generate();
    let trivia;

    it("Creates and initializes a Trivia", async () => {
        await program.rpc.initialize({
            accounts: {
                trivia: triviaKeypair.publicKey,
                authority: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [triviaKeypair]
        });

        trivia = await program.account.trivia.fetch(triviaKeypair.publicKey);
        assert.equal(trivia.games.length, 0);
    });

    it("Creates a game for Trivia", async () => {
        const question = {
            question: sha256('What is the best blockchain?'),
            revealedQuestion: null,
            variants: [
                sha256('What is the best blockchain?', 'Ethereum'),
                sha256('What is the best blockchain?', 'Solana'),
                sha256('What is the best blockchain?', 'Bitcoin')
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
        );

        trivia = await program.account.trivia.fetch(triviaKeypair.publicKey);
        assert.deepEqual(
            trivia.games,
            [{
                id: 0,
                name: 'Clever',
                questions: [question],
                revealedQuestions: []
            }]
        );
    });

    it("Reveals a question for Trivia", async () => {
        const revealedQuestion = {
            id: 0,
            question: 'What is the best blockchain?',
            variants: [
                'Ethereum',
                'Solana',
                'Bitcoin'
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
        );

        trivia = await program.account.trivia.fetch(triviaKeypair.publicKey);
        assert.deepEqual(
            trivia.games[0].revealedQuestions,
            [{
                question: revealedQuestion.question,
                variants: revealedQuestion.variants
            }]
        );
    });
});

describe("sha256", () => {
    it("Returns correct hash for multiple values", () => {
        const decode = (hash) => [...anchor.utils.bytes.hex.decode(hash)]

        assert.deepEqual(decode('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'), sha256(''))
        assert.deepEqual(decode('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'), sha256('hello'))
        assert.deepEqual(decode('e6b909f7443062918636b41ecc22b45276caf2f1fb2cccf0b22f6daab4d783b2'), sha256('hello', 'world'))
    })
});
