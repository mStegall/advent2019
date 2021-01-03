import { readFileSync } from "fs";
import { exit } from "process";

let input = readFileSync("./18/input.txt").toString();

const grid = input.split('\n').map(row => row.split(''))

const keys: Set<string> = new Set()
let sx = 0
let sy = 0

input.split('\n').forEach((row, y) => {
    row.split('').forEach((v, x) => {
        if (v != '#' && v != '.') {
            if (isKey(v)) {
                keys.add(v)
            } else if (isStart(v)) {
                sx = x
                sy = y
            }
        }
    })
})

function isStart(s: string): boolean {
    return s.charCodeAt(0) == 64
}

function isKey(s: string): boolean {
    return s.charCodeAt(0) >= 97
}

interface state {
    keys: string[],
    x: number
    y: number
    distance: number
}

const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]]

function plan() {
    const candidates: state[] = [{
        distance: 0,
        keys: [],
        x: sx,
        y: sy,
    }]

    const seen = new Set()

    while (candidates.length > 0 ) {
        const s = candidates.shift() as state

        dirs.forEach(([dx, dy]) => {
            const v = grid[s.y + dy][s.x + dx]

            if (v == '#') { return }

            if ((v <= "Z" && v >= "A") && !s.keys.includes(v.toLowerCase())) { return }


            let nextKeys = s.keys
            if (isKey(v)) {
                nextKeys = Array.from(new Set(s.keys).add(v)).sort()
                
                if (nextKeys.length == keys.size) {
                    console.log(s.distance + 1)
                    exit(0)
                }
            }

            const key = `${s.x + dx}:${s.y +dy}:${nextKeys.join('')}`

            if (seen.has(key)) {
                return
            }
            seen.add(key);

            candidates.push({
                distance: s.distance + 1,
                keys: nextKeys,
                x: s.x + dx,
                y: s.y + dy,
            })
        })
    }
}

plan()