import { PublicKey } from '@solana/web3.js';
import { TriviaProgram } from './data';
export declare type PDA = [PublicKey, number];
export declare function TriviaPDA(programId: TriviaProgram['programId']): Promise<PDA>;
export declare function GamePDA(programId: TriviaProgram['programId'], trivia: PublicKey, gameIndex: number): Promise<PDA>;
export declare function UserPDA(programId: TriviaProgram['programId'], trivia: PublicKey, user: PublicKey): Promise<PDA>;
export declare function PlayerPDA(programId: TriviaProgram['programId'], game: PublicKey, user: PublicKey): Promise<PDA>;
export declare function AnswerPDA(programId: TriviaProgram['programId'], question: PublicKey, player: PublicKey): Promise<PDA>;
