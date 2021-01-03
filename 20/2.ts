import { readFileSync } from "fs";
import { exit, stdout } from "process";

const input = readFileSync("./20/input.txt").toString().split('\n').map(i => i.split(''))

let sx = 0
let sy = 0
let zx = 0
let zy = 0
type coord = [number, number]
//[pos, distance, z]
type state = [coord, number, number]
//[ent, exit, outer]
const tmpPortal: Map<string, [coord, coord, boolean]> = new Map()
const portals: Map<string, [coord, boolean, string]> = new Map()

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

            console.log(enter)

            const isOuter = enter[0] == 1 || enter[0] == input.length - 2 || enter[1] == 1 || enter[1] == input[0].length - 2

            if (!out) {
                tmpPortal.set(label, [enter, exit, isOuter])
            } else {
                portals.set(enter.join(','), [out[1], isOuter, label])
                portals.set(out[0].join(','), [exit, out[2], label])
            }
        }
    })
})

const candidates: state[] = [[[sy, sx], 0, 0]]
const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]]

const seen: Set<string> = new Set()

// console.log(portals)
// // exit()
stdout.write(`\x1b[2J`)
stdout.write(`\x1b[H`)
stdout.write(input.map(i => i.join('')).join('\n'))
stdout.write(`\x1b[1m\x1b[31m`)
stdout.write(`\x1b[${zy + 1};${zx + 1}HZ`)
stdout.write(`\x1b[${sy + 1};${sx + 1}HA`)
Array.from(portals.values()).forEach(([[y, x], outer]) => {
    stdout.write(`\x1b[${y + 1};${x + 1}H${outer ? 'O' : 'I'}`)
})
stdout.write(`\x1b[0m`)
// stdout.write(`\x1b[2J`)



async function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms))
}

async function main() {
    await sleep(1000)

    while (candidates.length > 0) {
        // console.log(candidates)
        const s = candidates.shift() as state

        dirs.forEach(([dx, dy]) => {
            let [c, d, z] = s
            let tx = c[1] + dx
            let ty = c[0] + dy

            if (tx == zx && ty == zy && z == 0) {
                stdout.write(`\x1b[${input.length + 2};0H`)
                console.log(s[1] + 1)
                exit()
            }

            // console.log(tx,ty, s[1], input[ty][tx])
            const portalOut = portals.get([ty, tx].join(','))
            if (input[ty][tx] != '.' && !portalOut) {
                return
            }
            if (portalOut) {
                // outer
                if (portalOut[1]) {
                    if (z > 0) {

                        [ty, tx] = portalOut[0]
                        z--
                    }

                } else {
                    [ty, tx] = portalOut[0]
                    z++
                }
            }

            const key = [ty, tx, z].join(',')
            if (seen.has(key)) {
                return
            }
            // if (portalOut) {console.log(portalOut)}
            if (z == 0) { stdout.write(`\x1b[${ty + 1};${tx + 1}HX`) }
            seen.add(key)
            candidates.push([[ty, tx], d + 1, z])
        })
    }

    stdout.write(`\x1b[${input.length + 2};0H`)

    await sleep(10000)

    console.log("RAN OUT OF OPTIONS!")
}

main()