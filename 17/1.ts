import { readFileSync } from "fs"
import { stdout } from "process"
import { formatDiagnostic } from "typescript";
import { getMachine, machineRuntime } from "../intcode/intcode";

const input = readFileSync("./17/input.txt").toString();
const machine = getMachine(input)

let nextOp: ReturnType<machineRuntime["next"]> = {
    value: undefined,
    done: false,
};
const charMap = {
    35: '#',
    46: '.',
    10: '\n',
    94: '^'
}

const grid: boolean[][] = [[]]

async function main() {
    while (!nextOp.done) {
        if (nextOp.value === "INPUT") {
            throw new Error("AAAA")
        }

        if (nextOp.value === "OUTPUT") {
            const output = machine.runtime.next();
            if (typeof output.value != "number" || !(output.value == 10 || output.value == 46 || output.value == 35 || output.value == 94)) {
                throw Error(`bad type ${output.value} ${output.done}`)
            }
            stdout.write(charMap[output.value])

            switch (output.value) {
                case 10:
                    grid.push([])
                    break
                case 46:
                case 35:
                    grid[grid.length - 1].push(output.value == 35)
            }
        }

        if (nextOp.done) {
            break;
        }

        nextOp = machine.runtime.next();
    }

    let sum = 0

    for (let y = 1; y < grid.length - 1; y++) {
        for (let x = 1; x < grid[0].length - 1; x++) {
            if (grid[y][x - 1] && grid[y][x + 1] && grid[y + 1][x] && grid[y - 1][x]) {
                sum += x*y
            }
        }
    }

    console.log(sum)
}

main();