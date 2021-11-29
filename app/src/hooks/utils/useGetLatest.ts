import { useCallback, useLayoutEffect, useRef } from 'react'

export type AnyFunction = (...args: any[]) => any

export function useGetLatest<T extends AnyFunction>(fn: T) {
    const ref = useRef<T>(fn)

    useLayoutEffect(() => {
        ref.current = fn
    }, [fn])

    return useCallback((...args: Parameters<T>) => ref.current!(...args), []) as T
}
