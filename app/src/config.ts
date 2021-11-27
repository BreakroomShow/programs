import { getPhantomWallet } from '@solana/wallet-adapter-wallets'
import * as solana from '@solana/web3.js'

import { TriviaIdl, idl } from './types'

export const triviaIdl = idl as unknown as TriviaIdl
export const preflightCommitment = 'processed'
export const programID = new solana.PublicKey(idl.metadata.address)
export const wallets = [getPhantomWallet()]

const devnet = solana.clusterApiUrl('devnet')

export const network = devnet
