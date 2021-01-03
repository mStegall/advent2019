import {  readFileSync } from "fs";

const deckSize = BigInt(119315717514047)

const reInc = /deal with increment (\d*)/
const reCut = /cut (-?\d*)/

function modB(i: bigint, n: bigint) { if (i % n > 0) { return i % n } return (i % n) + n }

// https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm#Modular_integers
function inverseMod(a: bigint, n: bigint) {
    let t = 0n
    let newt = 1n
    let r = n
    let newr = a

    while (newr != 0n) {
        let q = r / newr
        let tmpt = newt
        newt = t - q * newt
        t = tmpt

        let tmpr = newr
        newr = r - q * newr
        r = tmpr
    }

    if (r > 1) {
        throw new Error("Not invertable")
    }
    if (t < 0) {
        t += n
    }

    return t
}

const cardAt = (i: bigint, l: bigint, a: bigint, b: bigint) => modB((i - b) * (a > 0n ? 1n : -1n) * inverseMod(a, l), l)

const readRules = (start: [bigint, bigint]): [bigint, bigint] => readFileSync('./22/input.txt').toString().split('\n').reduce(([a, b], i): [bigint, bigint] => {
    if (i == "deal into new stack") {
        return [-a, modB(-b - 1n, deckSize)]
    }

    const res = reInc.exec(i)
    if (res) {
        const d = BigInt(parseInt(res[1], 10))

        return [modB(a * d, deckSize), modB(b * d, deckSize)]
    }

    const res2 = reCut.exec(i)
    if (res2) {
        const index = BigInt(parseInt(res2[1], 10))

        return [a, modB(b - index, deckSize)]
    }

    return [a, b]
}, start)

const mulMod = (a: bigint, b: bigint, n: bigint) => modB(a * b, n)
const sqMod = (a: bigint, n: bigint) => modB(a * a, n)
const expMod = (a: bigint, b: bigint, n: bigint): bigint => {
    if (b == 1n) {
        return a
    }
    if (b % 2n == 0n) {
        return expMod(sqMod(a, n), b / 2n, n)
    }

    return mulMod(a, expMod( sqMod(a, n), (b - 1n) / 2n, n),n)
}

let [a, b]: [bigint, bigint] = readRules([1n, 0n])

const r = 101741582076661n

const aR = expMod(a, r, deckSize)
const top = modB(1n - aR, deckSize)
const bottom = inverseMod(modB(1n - a, deckSize), deckSize)
const newB = mulMod(b, mulMod(top, bottom, deckSize), deckSize)

console.log(cardAt(2020n,deckSize,aR,newB))