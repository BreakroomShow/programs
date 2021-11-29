import './index.css'

import { StrictMode } from 'react'
import { render } from 'react-dom'

import { App } from './App'
import { ConnectProvider } from './containers/ConnectProvider'
import { QueryProvider } from './containers/QueryProvider'

render(
    <StrictMode>
        <ConnectProvider>
            <QueryProvider>
                <App />
            </QueryProvider>
        </ConnectProvider>
    </StrictMode>,
    document.getElementById('root'),
)
