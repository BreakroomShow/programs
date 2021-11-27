import './index.css'

import { StrictMode } from 'react'
import { render } from 'react-dom'

import { App } from './App'
import { ConnectProvider } from './containers/ConnectProvider'

render(
    <StrictMode>
        <ConnectProvider>
            <App />
        </ConnectProvider>
    </StrictMode>,
    document.getElementById('root'),
)
