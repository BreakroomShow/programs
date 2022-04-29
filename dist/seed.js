"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrizeFundVaultAuthorityPDA = exports.PrizeFundVaultPDA = exports.PlayerPDA = exports.UserPDA = exports.GamePDA = exports.TriviaPDA = void 0;
const web3_js_1 = require("@solana/web3.js");
const TRIVIA = 'trivia';
const GAME = 'game';
const USER = 'user';
const PLAYER = 'player';
const VAULT = 'vault';
const VAULT_AUTHORITY = 'vault_authority';
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
function PrizeFundVaultPDA(programId, game) {
    return web3_js_1.PublicKey.findProgramAddress([Buffer.from(VAULT), game.toBuffer()], programId);
}
exports.PrizeFundVaultPDA = PrizeFundVaultPDA;
function PrizeFundVaultAuthorityPDA(programId, game) {
    return web3_js_1.PublicKey.findProgramAddress([Buffer.from(VAULT_AUTHORITY), game.toBuffer()], programId);
}
exports.PrizeFundVaultAuthorityPDA = PrizeFundVaultAuthorityPDA;
