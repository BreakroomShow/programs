import * as anchor from '@project-serum/anchor';
import { TriviaIdl } from './index';
import { Optional } from "./common";
export declare type TriviaProgram = anchor.Program<TriviaIdl>;
export interface Trivia {
    authority: anchor.web3.PublicKey;
    gamesCounter: number;
}
export interface User {
    trivia: anchor.web3.PublicKey;
    authority: anchor.web3.PublicKey;
    finishedGamesCounter: number;
    leftInvitesCounter: number;
}
export interface Player {
    game: anchor.web3.PublicKey;
    user: anchor.web3.PublicKey;
    authority: anchor.web3.PublicKey;
    answers: number[];
}
export interface Game {
    trivia: anchor.web3.PublicKey;
    authority: anchor.web3.PublicKey;
    name: string;
    startTime: anchor.BN;
    questionKeys: anchor.web3.PublicKey[];
    questions?: Question[];
    revealedQuestionsCounter: number;
}
export interface CreateGameOptions {
    name: string;
    startTime: anchor.BN;
}
export interface EditGameOptions extends Optional<CreateGameOptions> {
}
export interface Question {
    game: anchor.web3.PublicKey;
    authority: anchor.web3.PublicKey;
    question: number[];
    variants: number[][];
    time: anchor.BN;
    revealedQuestion?: RevealedQuestion;
}
export interface RevealedQuestion {
    question: string;
    variants: string[];
    deadline: anchor.BN;
    answerKeys: anchor.web3.PublicKey[][];
    answers?: Answer[];
    answerVariantId?: number;
}
export interface Answer {
    question: anchor.web3.PublicKey;
    authority: anchor.web3.PublicKey;
    variantId: number;
}
