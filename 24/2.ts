import { readFileSync } from "fs";
import { stdout } from "process";




type grid = Set<string>

let g: grid = new Set()

readFileSync('./24/input.txt').toString()
    .split('\n').forEach((row, y) => {
        row.split('').forEach((v, x) => {
            if (v == '#') {
                g.add([x, y, 0].join(','))
            }
        })
    })

function scoreGrid(g: grid): number {
    return Array.from(g.values()).reduce((acc, i): number => {
        const [x, y] = i.split(',').map(i => parseInt(i, 10));

        return 2 ** (y * 5 + x) + acc
    }, 0)
}

const neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]]
const center = [2, 2]
const left = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] as const
const right = [[4, 0], [4, 1], [4, 2], [4, 3], [4, 4]] as const
const up = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] as const
const down = [[0, 4], [1, 4], [2, 4], [3, 4], [4, 4]] as const

function getEdge(x: number, y: number): readonly (readonly [number, number])[] {
    if (x == 1) {
        return left
    }
    if (x == -1) {
        return right
    }
    if (y == 1) {
        return up
    }
    if (y == -1) {
        return down
    }

    throw new Error(`Bad edge ${x},${y}`)
}

function countNeighbors(g: grid, x: number, y: number, z: number): number {
    return neighbors.reduce((acc, [dx, dy]) => {
        const tx = x + dx
        const ty = y + dy

        if (tx < 0 || tx > 4 || ty < 0 || ty > 4) {
            if (g.has([2 + dx, 2 + dy, z - 1].join(","))) {
                return acc + 1
            }
            return acc
        }

        if (tx == 2 && ty == 2) {
            const edgeCount = getEdge(dx, dy).reduce((acc, [x, y]) => {
                if (g.has([x, y, z + 1].join(","))) {
                    return acc + 1
                }
                return acc
            }, 0)
            // console.log(getEdge(dx,dy),dx,dy)
            return acc + edgeCount
        }

        if (g.has([tx, ty, z].join(","))) {
            return acc + 1
        }
        return acc
    }, 0)
}

let upper = -1
let lower = 1

function isLive(g: grid, x: number, y: number, z: number) {
    const count = countNeighbors(g, x, y, z)
    const key = [x, y, z].join(',')
    const curr = g.has(key)

    return count == 1 || (count == 2 && !curr)
}

function nextGrid(g: grid): grid {
    const next: grid = new Set()

    for (let z = upper; z <= lower; z++) {

        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                if (x == y && y == 2) {
                    continue
                }

                if (isLive(g, x, y, z)) {
                    upper = Math.min(upper, z - 1)
                    lower = Math.max(lower, z + 1)
                    next.add([x, y, z].join(','))
                }
            }
        }
    }

    return next
}

function printGrids(g: grid) {
    for (let z = upper; z <= lower; z++) {
        stdout.write('D' + z + '\n')
        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 5; x++) {
                const key = [x, y, z].join(',')
                if (x == y && y == 2) {
                    stdout.write('?')
                    continue
                }
                if (!isLive(g, x, y, z)) {
                    stdout.write(`\x1b[1m\x1b[31m`)
                }
                stdout.write(g.has(key) ? '#' : '.')
                stdout.write(`\x1b[0m`)
            }

            stdout.write('\n')
        }
        stdout.write('\n')
    }
    stdout.write('=============================\n')
}

for (let i = 0; i < 200; i++) {
    g = nextGrid(g)
}
// printGrids(g)
console.log(g.size)
