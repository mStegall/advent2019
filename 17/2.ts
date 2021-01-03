import { readFileSync } from "fs"
import { stdout } from "process"
import { formatDiagnostic } from "typescript";
import { getMachine, machineRuntime } from "../intcode/intcode";

let input = readFileSync("./17/input.txt").toString();
input = '2' + input.slice(1)
const machine = getMachine(input)

let nextOp: ReturnType<machineRuntime["next"]> = machine.runtime.next();

const charMap = {
    35: '#',
    46: '.',
    10: '\n',
    94: '^'
}

const grid: boolean[][] = [[]]

const machineInput = `A,B,A,C,B,C,A,C,B,C
L,8,R,10,L,10
R,10,L,8,L,8,L,10
L,4,L,6,L,8,L,8
n
`.split('')

const tes2 = `A,B,A,C,B,C,A,C,B,C`

async function main() {
    while (!nextOp.done) {
        if (nextOp.value === "INPUT") {
            
            machine.runtime.next();
            const nextInput = machineInput.shift()?.charCodeAt(0)
            console.log('inputting ',nextInput)
            nextOp = machine.runtime.next(nextInput);
            // throw new Error("AAAA")
        }

        if (nextOp.value === "OUTPUT") {
            const output = machine.runtime.next();
            // if (typeof output.value != "number" || !(output.value == 10 || output.value == 46 || output.value == 35 || output.value == 94)) {
            //     console.log(output.value)
            //     // throw Error(`bad type ${output.value} ${output.done}`)
            // } else {
            if(typeof output.value == "number"){
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

        // console.log(nextOp.value)
    }
}

main();