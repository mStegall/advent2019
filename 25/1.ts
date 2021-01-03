import { readFileSync } from "fs"
import { stdin, stdout } from "process"
import { getMachine, machineRuntime } from "../intcode/intcode";
import { createInterface } from "readline";

let input = readFileSync("./25/input.txt").toString();
const machine = getMachine(input)

let nextOp: ReturnType<machineRuntime["next"]> = machine.runtime.next();

let inputBuffer: string[] = []

const rl = createInterface({
    input: stdin,
    output: stdout
});

async function getInput(): Promise<string> {
    return new Promise(r => {
        rl.question('', r)
    })
}

async function main() {
    while (!nextOp.done) {
        if (nextOp.value === "INPUT") {
            machine.runtime.next();
            if (!inputBuffer.length) {
                const input = await getInput();
                inputBuffer = input.split('').concat('\n')
            }
            const nextInput = inputBuffer.shift()?.charCodeAt(0)
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