import { ReactNode } from 'react'
import { QueryClientProvider } from 'react-query'

import { queryClient } from '../api/query'

export function QueryProvider({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
