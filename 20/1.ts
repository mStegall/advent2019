import { readFileSync } from "fs";
import { exit, stdout } from "process";

const input = readFileSync("./20/input.txt").toString().split('\n').map(i => i.split(''))

let sx = 0
let sy = 0
let zx = 0
let zy = 0
type coord = [number, number]
type state = [coord, number]
//[ent,exit]
const tmpPortal: Map<string, [coord, coord]> = new Map()
const portals: Map<string, [number, number]> = new Map()

input.forEach((row, y) => {
    row.forEach((v, x) => {
        if (v <= 'Z' && v >= 'A') {
            let label: string
            input[y][x] = ' '

            const exit: coord = [y, x]
            const enter: coord = [y, x]

            if (input[y + 1][x] >= 'A' && input[y + 1][x] <= 'Z') {
                // horizontal case
                label = v + input[y + 1][x]
                input[y + 1][x] = ' '

                if (y - 1 > 0 && input[y - 1][x] == '.') {
                    // exit to the left
                    exit[0] = y - 1
                } else {
                    exit[0] = y + 2
                    enter[0]++
                }
            } else {
                // vertical case
                label = v + row[x + 1]
                row[x + 1] = ' '


                if (x - 1 > 0 && input[y][x - 1] == '.') {
                    // exit up
                    exit[1] = x - 1
                } else {
                    exit[1] = x + 2
                    enter[1]++
                }
            }

            if (label == "AA") {
                sx = exit[1]
                sy = exit[0]

                return
            }

            if (label == "ZZ") {
                zx = exit[1]
                zy = exit[0]
                return
            }

            const out = tmpPortal.get(label)

            if (!out) {
                tmpPortal.set(label, [enter, exit])
            } else {
                portals.set(enter.join(','), out[1])
                portals.set(out[0].join(','), exit)
            }
        }
    })
})

const candidates: state[] = [[[sy, sx], 0]]
const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]]

const seen: Set<string> = new Set()

// console.log(portals)
// exit()
stdout.write(`\x1b[2J`)
stdout.write(`\x1b[H`)
stdout.write(input.map(i => i.join('')).join('\n'))
stdout.write(`\x1b[1m\x1b[31m`)
stdout.write(`\x1b[${zy + 1};${zx + 1}HZ`)
stdout.write(`\x1b[${sy + 1};${sx + 1}HA`)
Array.from(portals.values()).forEach(([y, x]) => {
    stdout.write(`\x1b[${y + 1};${x + 1}HP`)
})
stdout.write(`\x1b[0m`)

async function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms))
}

async function main() {


    await sleep(1000)

    while (candidates.length > 0) {
        // console.log(candidates)
        const s = candidates.shift() as state

        dirs.forEach(([dx, dy]) => {
            const c = s[0]
            let tx = c[1] + dx
            let ty = c[0] + dy

            if (tx == zx && ty == zy) {
                console.log(s[1] + 1)
                exit()
            }

            // console.log(tx,ty, s[1], input[ty][tx])
            const portalOut = portals.get([ty, tx].join(','))
            if (input[ty][tx] != '.' && !portalOut) {
                return
            }
            if (portalOut) {
                ty = portalOut[0]
                tx = portalOut[1]
            }

            const key = [ty, tx].join(',')
            if (seen.has(key)) {
                return
            }


            stdout.write(`\x1b[${ty + 1};${tx + 1}HX`)
            seen.add(key)
            candidates.push([[ty, tx], s[1] + 1])
        })
        await sleep(3)

    }
}

main()