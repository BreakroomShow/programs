"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnswerPDA = exports.PlayerPDA = exports.GamePDA = exports.TriviaPDA = void 0;
const anchor = __importStar(require("@project-serum/anchor"));
const TRIVIA = 'trivia';
const GAME = 'game';
const WHITELISTED_PLAYER = 'whitelisted_player';
const ANSWER = 'answer';
function TriviaPDA(programId) {
    return anchor.web3.PublicKey.findProgramAddress([Buffer.from(TRIVIA)], programId);
}
exports.TriviaPDA = TriviaPDA;
function GamePDA(programId, trivia, gameIndex) {
    return anchor.web3.PublicKey.findProgramAddress([Buffer.from(GAME), trivia.toBuffer(), Buffer.from(gameIndex.toString())], programId);
}
exports.GamePDA = GamePDA;
function PlayerPDA(programId, trivia, user) {
    return anchor.web3.PublicKey.findProgramAddress([Buffer.from(WHITELISTED_PLAYER), trivia.toBuffer(), user.toBuffer()], programId);
}
exports.PlayerPDA = PlayerPDA;
function AnswerPDA(programId, trivia, game, question, player) {
    return anchor.web3.PublicKey.findProgramAddress([Buffer.from(ANSWER), trivia.toBuffer(), game.toBuffer(), question.toBuffer(), player.toBuffer()], programId);
}
exports.AnswerPDA = AnswerPDA;
