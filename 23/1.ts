import { readFileSync } from "fs"
import { exit, stdout } from "process"
import { getMachine, machineRuntime, machine } from "../intcode/intcode";

let input = readFileSync("./23/input.txt").toString();

interface node {
    input: number[]
    machine: machine
    packetBuffer: number[]
    nextOp: ReturnType<machineRuntime["next"]>
}

const nodes: node[] = Array(50).fill(0).map((_, i) => {
    const m = getMachine(input)
    return {
        input: [i],
        machine: m,
        packetBuffer: [],
        nextOp: m.runtime.next()
    }
})
console.log(nodes.map(i=>i.packetBuffer))
async function main(){while(true){
    
    nodes.forEach(m => {
        if (m.nextOp.value === "INPUT") {
            m.machine.runtime.next();
            const nextInput = m.input.shift()
            m.nextOp = m.machine.runtime.next(nextInput != undefined ? nextInput : -1);
        }
    
        if (m.nextOp.value === "OUTPUT") {
            const output = m.machine.runtime.next();
            if (typeof output.value == "number") {
                m.packetBuffer.push(output.value)
                if(m.packetBuffer.length ==3){
                    const [dst,x,y] = m.packetBuffer
                    // console.log(m.packetBuffer)
                    m.packetBuffer = m.packetBuffer.slice(3)
                    if(dst ==255){
                        stdout.write(`\x1b[2J\x1b[H`)
                        console.log(y)
                        exit()
                    }
                    // console.log(dst,x,y)
                    // console.log(m.packetBuffer)
                    nodes[dst].input.push(x,y)
                }
            }
    
            m.nextOp = m.machine.runtime.next();
        }
    })

    stdout.write(`\x1b[2J\x1b[H`)
    console.log(nodes.map(i=>String(i.nextOp.value) + i.input.join(':') + " | " + i.packetBuffer.join(':')).join('\n'))
    await sleep(100)    
}}

async function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms))
}

main()