import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { ReactNode } from 'react'

import * as config from '../config'

export function ConnectProvider({ children }: { children: ReactNode }) {
    return (
        <ConnectionProvider endpoint={config.network}>
            <WalletProvider wallets={config.wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}
