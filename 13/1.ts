import { readFileSync} from "fs"
import { exit } from "process"

const input = readFileSync("./input.txt").toString();

const FINISH = 99;
const ADD = 1;
const MULTIPLY = 2;
const INPUT = 3;
const OUTPUT = 4;
const JIT = 5;
const JIF = 6;
const LT = 7;
const EQ = 8;
const SETREL = 9;

const padInstruction = (instruction:string) => {
    return Array(5-instruction.length).fill('0').join('') + instruction
}

const getParamPos = (tape: number[], mode: string, pos: number, base: number) => {
       switch (mode) {
    case '0':
	return tape[pos];
    case '1':
	return pos;
    case '2':
	debug(`Rel pos: ${tape[pos]+ base}`);
	return tape[pos] + base;
    default:
	throw new Error(`Bad addressing mode: ${mode}`);
    }
}

const getParam = (tape: number[], mode: string, pos: number, base: number) => {
    return tape[getParamPos(tape, mode,pos,base)] || 0;
};

function* runProgram (tape:number[]) {
    tape = [...tape];
    
    let pc = 0;
    let i = 0;
    let relativeBase = 0;
    
    while(i < 1000000){
	i ++

	const instruction = tape[pc];
	const [mode3, mode2, mode1, ...opCodeDigits] = padInstruction(instruction.toString()).split('')
	const opCode = parseInt(opCodeDigits.join(''));

	const param1 = getParam(tape, mode1, pc + 1, relativeBase);
	const param2 = getParam(tape, mode2, pc + 2, relativeBase);
	const param3Pos = getParamPos(tape,mode3, pc+3, relativeBase);

	debug(`OpCode: ${opCode}; Params: [${param1},${param2}]; Modes: [${mode1},${mode2}]; [${tape[pc+1]},${tape[pc+2]},${tape[pc+3]}]`)
	
	switch (opCode) {
	case ADD:
	    // console.log('add');
	    tape[param3Pos] = param1 + param2;
	    pc += 4;
	    break;
	    
	case MULTIPLY:
	    tape[param3Pos] = param1 * param2;
	    pc += 4;
	    break;

	case INPUT:
	    debug('Waiting for input');
	    yield "INPUT";
	    debug('got input');
	    const input = yield;
	    debug('Input', input);
	    if(typeof input != 'number'){
		throw new Error(`No input available`);
	    }
	    tape[getParamPos(tape,mode1,pc+1,relativeBase)] = input;
	    pc += 2;
	    break;

	case OUTPUT:
	    debug('Outputing', param1);
	    yield "OUTPUT";
	    yield param1;
	    pc += 2;
	    break;

	case JIT:
	    if(param1){
		pc = param2;
	    } else {
		pc += 3;
	    }
	    break;

	case JIF:
	    if(!param1){
		pc = param2;
	    } else {
		pc += 3;
	    }
	    break;

	case LT:
	    tape[param3Pos] = param1 < param2 ? 1 : 0;
	    pc += 4;
	    break;

	case EQ:
	    tape[param3Pos] = param1 === param2 ? 1 : 0;
	    pc += 4;
	    break;

	case SETREL:
	    debug('SETREL');
	    relativeBase += param1;
	    pc += 2;
	    break;
	    
	case FINISH:
	    return;

	default :
	    debug('wat')
	    throw new Error(`Unrecognized OpCode:${opCode}`);
	}
    }

    throw new Error(`Hit max iterations`)
}

const inputTape = input.split(',').map(i => parseInt(i));

const permute = (input: number[], values: number[]): number[][] => {
    if(values.length === 0){
	return [input];
    }
    
    return values.reduce((acc: number[][], v, index) => {
	const newInput = [...input, v];
	const newValues = [...values.slice(0, index), ... values.slice(index + 1)];
	// console.log(newInput, newValues)
	return acc.concat(permute(newInput, newValues))
    }, [])
}


    

const debug = (...params:any) => {

    // console.log(...params)
}

const runtime = runProgram(inputTape);
const machine = {
    runtime,
    done: false,
}

let x = 0;
let y = 0;
let direction = 0;

const hullMap: Map<string, 1 | 0> = new Map();
const paintedPanels: Set<string> = new Set();

hullMap.set(`${x}:${y}`, 1)

let nextOp: IteratorResult<number | "INPUT" | "OUTPUT" | undefined, void> = {
    value: undefined,
    done: false,
};

const outputs: number[] = [];


while(!machine.done){

    // debug(nextOp, machine.inputs);

    if (nextOp.value === "INPUT") {
	throw new Error('No inputs to provide');
    }

    if (nextOp.value === "OUTPUT"){
	debug('GOT OUTPUT');
	const outputFrame = machine.runtime.next();
	debug(outputFrame);
	if(typeof outputFrame.value == 'number'){
	    // Handle outputs
	    outputs.push(outputFrame.value)
	}
    }
    
    if(nextOp.done){
	machine.done = true;
	break;
    }

    nextOp = machine.runtime.next();
}

const screen: number[][] = Array(26).fill('').map(_ => []);
console.log(outputs);
while (outputs.length) {
    const x = outputs.shift();
    const y = outputs.shift();
    const id = outputs.shift();

    if(!(typeof x == 'number' && typeof y == 'number' && typeof id == 'number' )){
	throw new Error('Bad output')
    }
    screen[y][x] = id;
}

console.log(screen.map(row => row.filter(i => i == 2).length).reduce((a,b) => a + b))
