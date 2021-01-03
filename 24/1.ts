import { readFileSync } from "fs";
import { stdout } from "process";




type grid = Set<string>

let g: grid = new Set()

readFileSync('./24/input.txt').toString()
    .split('\n').forEach((row, y) => {
        row.split('').forEach((v, x) => {
            if (v == '#') {
                g.add([x, y].join(','))
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

function countNeighbors(g: grid, x: number, y: number): number {
    return neighbors.reduce((acc, [dx, dy]) => {
        if (g.has([x + dx, y + dy].join(","))) {
            return acc + 1
        }
        return acc
    }, 0)
}

function nextGrid(g: grid): grid {
    const next: grid = new Set()

    for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
            const count = countNeighbors(g, x, y)
            const key = [x, y].join(',')
            const curr = g.has(key)
            if (count == 1 || (count == 2 && !curr)) {
                next.add(key)
            }
        }
    }

    return next
}

function printGrid(g: grid) {
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            const key = [x, y].join(',')
            stdout.write(g.has(key) ? '#' : '.')
        }

        stdout.write('\n')
    }
    stdout.write('\n')
}

function gridKey(g: grid){
    return Array.from(g.values()).join(':')
}

const seen:Set<string> = new Set()

while(!seen.has(gridKey(g))){
    seen.add(gridKey(g))
    g = nextGrid(g)
}
printGrid(g)

console.log(scoreGrid(g))