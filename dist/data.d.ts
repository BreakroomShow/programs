import * as anchor from '@project-serum/anchor';
import { TriviaIdl } from './index';
import { Optional } from "./common";
import { IdlAccounts } from "@project-serum/anchor";
export declare type TriviaProgram = anchor.Program<TriviaIdl>;
export interface Game extends Omit<IdlAccounts<TriviaIdl>["game"], "questionKeys"> {
    questionKeys: (anchor.web3.PublicKey | null)[];
    questions?: IdlAccounts<TriviaIdl>["question"][];
}
export interface CreateGameOptions {
    name: string;
    startTime: anchor.BN;
}
export interface EditGameOptions extends Optional<CreateGameOptions> {
}
