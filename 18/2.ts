import { readFileSync } from "fs";
import { exit } from "process";

let input = readFileSync("./18/inputp2.txt").toString();

const grid = input.split('\n').map(row => row.split(''))

const keys: Set<string> = new Set()

function isStart(s: string): boolean {
    return s.charCodeAt(0) == 64
}

function isKey(s: string): boolean {
    return s.charCodeAt(0) >= 97
}

type pairsI = 'x1' | 'y1' | 'x2' | 'y2' | 'x3' | 'y3' | 'x4' | 'y4'
const pairsLabels: pairsI[] = ['x1' , 'y1' , 'x2' , 'y2' , 'x3' , 'y3' , 'x4' , 'y4']
type state = {
    [key in pairsI]: number;
} & {
    keys: string[]
    distance: number;
}

const baseState: state = {
    distance: 0,
    keys: [],
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    x3: 0,
    y3: 0,
    x4: 0,
    y4: 0,
}

input.split('\n').forEach((row, y) => {
    row.split('').forEach((v, x) => {
        if (v != '#' && v != '.') {
            if (isKey(v)) {
                keys.add(v)
            } else if (isStart(v)) {
                if (baseState.x1 == 0) {
                    baseState.x1 = x
                    baseState.y1 = y
                } else if (baseState.x2 == 0) {
                    baseState.x2 = x
                    baseState.y2 = y
                } else if (baseState.x3 == 0) {
                    baseState.x3 = x
                    baseState.y3 = y
                } else if (baseState.x4 == 0) {
                    baseState.x4 = x
                    baseState.y4 = y
                }
            }
        }
    })
})

const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]]
const pairs:[pairsI,pairsI][] = [['x1', 'y1'], ['x2', 'y2'], ['x3', 'y3'], ['x4', 'y4']]

function plan() {
    const candidates: state[] = [baseState]

    const seen = new Set()

    while (candidates.length > 0) {
        const s = candidates.shift() as state
        // console.log(candidates.length)
        pairs.forEach((p,i) => {
            dirs.forEach(([dx, dy]) => {
                const ny = s[p[1]] + dy
                const nx = s[p[0]] + dx
                
                const v = grid[ny][nx]

                // console.log(nx,ny,v)
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

                

                const next = {
                    ... s,
                    distance: s.distance + 1,
                    keys: nextKeys,
                    [p[0]]: nx,
                    [p[1]]: ny,
                }
                // console.log(next)

                const key = `${i}:${nx}:${ny}:${nextKeys.join('')}`
                // console.log(key)
                if (seen.has(key)) {
                    // console.log('seen')
                    return
                }
                seen.add(key);

                candidates.push(next)
            })
        })
    }
}

plan()