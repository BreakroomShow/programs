import * as anchor from '@project-serum/anchor'
import {sha256 as jssha256} from 'js-sha256'

export function sha256(...values: string[]) {
    const encoder = new TextEncoder()

    return [...values.reduce((acc, v) => Buffer.from(jssha256([...acc, ...encoder.encode(v)]), 'hex'), Buffer.from([]))]
}

describe('sha256', () => {
    it('Returns correct hash for multiple values', () => {
        const decode = (hash) => [...anchor.utils.bytes.hex.decode(hash)]

        expect(decode('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')).toStrictEqual(sha256(''))
        expect(decode('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')).toStrictEqual(sha256('hello'))
        expect(decode('e6b909f7443062918636b41ecc22b45276caf2f1fb2cccf0b22f6daab4d783b2')).toStrictEqual(sha256('hello', 'world'))
    })
})

export function promiseWithTimeout<T>(
    promise: Promise<T>,
    ms: number,
    timeoutError = new Error('Promise timed out'),
): Promise<T> {
    // create a promise that rejects in milliseconds
    const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
            reject(timeoutError)
        }, ms)
    })

    // returns a race between timeout and the passed promise
    return Promise.race<T>([promise, timeout])
}
