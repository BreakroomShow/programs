import { PublicKey } from '@solana/web3.js';
import { TriviaProgram } from './data';
export declare type PdaResult = [PublicKey, number];
export declare function TriviaPDA(programId: TriviaProgram['programId']): Promise<PdaResult>;
export declare function GamePDA(programId: TriviaProgram['programId'], trivia: PublicKey, gameIndex: number): Promise<PdaResult>;
export declare function PlayerPDA(programId: TriviaProgram['programId'], trivia: PublicKey, user: PublicKey): Promise<PdaResult>;
export declare function AnswerPDA(programId: TriviaProgram['programId'], trivia: PublicKey, game: PublicKey, question: PublicKey, player: PublicKey): Promise<PdaResult>;
