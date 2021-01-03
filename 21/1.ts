import { readFileSync } from "fs"
import { stdout } from "process"
import { getMachine, machineRuntime } from "../intcode/intcode";

let input = readFileSync("./21/input.txt").toString();
const machine = getMachine(input)

let nextOp: ReturnType<machineRuntime["next"]> = machine.runtime.next();

const machineInput = `NOT T T
AND A T
AND B T
AND C T
NOT T J
AND D J
WALK
`.split('')

async function main() {
    while (!nextOp.done) {
        if (nextOp.value === "INPUT") {
            machine.runtime.next();
            const nextInput = machineInput.shift()?.charCodeAt(0)
            nextOp = machine.runtime.next(nextInput);
        }

        if (nextOp.value === "OUTPUT") {
            const output = machine.runtime.next();
            if (typeof output.value == "number") {
                if (output.value < 256) {

                    stdout.write(String.fromCharCode(output.value))
                } else {
                    console.log(output.value)
                }
            }

            nextOp = machine.runtime.next();
        }

        if (nextOp.done) {
            break;
        }
    }
}

main();