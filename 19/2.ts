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


let x1 = 0
let x2 = 4
let y1 = 0
let y2 = 3

while ((x2 - x1) < 100 || (y2 - y1) < 100) {
    if ((y2 -y1)>(x2 -x1)){
        x2++
        while((y2-y1) <= 100 && probe(x2,y2+1)){
            y2 ++
        }
    } else {
        y2++
        while((x2 -x1) <= 100 && probe(x2+1,y2)){
            x2 ++
        }
    }
    
    while (!probe(x2,y1+1)){
        y1 ++
    }
    while(!probe(x1+1,y2)){
        x1 ++
    }
}

console.log((x1+1)*10000+y1+1)