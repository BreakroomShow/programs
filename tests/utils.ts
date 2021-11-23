import * as anchor from "@project-serum/anchor"
import {assert} from "chai"

function sha256(...values: string[]) {
    const sha256 = require("js-sha256")
    const encoder = new TextEncoder()

    return [...values.reduce(
        (previousValue, currentValue) =>
            Buffer.from(sha256([...previousValue, ...encoder.encode(currentValue)]), "hex"),
        Buffer.from([])
    )]
}

describe("sha256", () => {
    it("Returns correct hash for multiple values", () => {
        const decode = (hash) => [...anchor.utils.bytes.hex.decode(hash)]

        assert.deepEqual(decode("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"), sha256(""))
        assert.deepEqual(decode("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"), sha256("hello"))
        assert.deepEqual(decode("e6b909f7443062918636b41ecc22b45276caf2f1fb2cccf0b22f6daab4d783b2"), sha256("hello", "world"))
    })
})

export function promiseWithTimeout<T>(
    promise: Promise<T>,
    ms: number,
    timeoutError = new Error('Promise timed out')
): Promise<T> {
    // create a promise that rejects in milliseconds
    const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
            reject(timeoutError);
        }, ms);
    });

    // returns a race between timeout and the passed promise
    return Promise.race<T>([promise, timeout]);
}
