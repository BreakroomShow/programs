"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnswerPDA = exports.PlayerPDA = exports.UserPDA = exports.GamePDA = exports.TriviaPDA = void 0;
const web3_js_1 = require("@solana/web3.js");
const TRIVIA = 'trivia';
const GAME = 'game';
const USER = 'user';
const PLAYER = 'player';
const ANSWER = 'answer';
function TriviaPDA(programId) {
    return web3_js_1.PublicKey.findProgramAddress([Buffer.from(TRIVIA)], programId);
}
exports.TriviaPDA = TriviaPDA;
function GamePDA(programId, trivia, gameIndex) {
    return web3_js_1.PublicKey.findProgramAddress([Buffer.from(GAME), trivia.toBuffer(), Buffer.from(gameIndex.toString())], programId);
}
exports.GamePDA = GamePDA;
function UserPDA(programId, trivia, user) {
    return web3_js_1.PublicKey.findProgramAddress([Buffer.from(USER), trivia.toBuffer(), user.toBuffer()], programId);
}
exports.UserPDA = UserPDA;
function PlayerPDA(programId, game, user) {
    return web3_js_1.PublicKey.findProgramAddress([Buffer.from(PLAYER), game.toBuffer(), user.toBuffer()], programId);
}
exports.PlayerPDA = PlayerPDA;
function AnswerPDA(programId, question, player) {
    return web3_js_1.PublicKey.findProgramAddress([Buffer.from(ANSWER), question.toBuffer(), player.toBuffer()], programId);
}
exports.AnswerPDA = AnswerPDA;
