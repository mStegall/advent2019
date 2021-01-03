import { readFileSync } from "fs"
import { stdout } from "process"
import { getMachine, machineRuntime } from "../intcode/intcode";

let input = readFileSync("./19/input.txt").toString();

function probe(x: number, y: number): boolean {
    const machine = getMachine(input)

    let nextOp: ReturnType<machineRuntime["next"]> = machine.runtime.next();
    const inputs = [x, y]

    while (!nextOp.done) {
        if (nextOp.value === "INPUT") {

            machine.runtime.next();
            const nextInput = inputs.shift()
            nextOp = machine.runtime.next(nextInput);
            // throw new Error("AAAA")
        }

        if (nextOp.value === "OUTPUT") {
            const output = machine.runtime.next();

            if (typeof output.value == "number") {
                return output.value == 1
            }

            nextOp = machine.runtime.next();
        }

        if (nextOp.done) {
            break;
        }
    }
    throw new Error("No outpu")
}

async function main() {
    let count = 0;

    for (let y = 0; y < 50; y++) {
        for (let x = 0; x < 50; x++) {

            if (probe(x, y)) {
                count++
                stdout.write('#')
            } else {
                stdout.write('.')
            }
        }
        stdout.write('\n')
    }

    console.log(count)
}

main();