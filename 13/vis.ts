import { readFileSync} from "fs"
import { exit, stdout } from "process"

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

const debug = (...params:any) => {
    // console.log(...params)
}

inputTape[0] = 2;

const runtime = runProgram(inputTape);
const machine = {
    runtime,
    done: false,
}

let nextOp: IteratorResult<number | "INPUT" | "OUTPUT" | undefined, void> = {
    value: undefined,
    done: false,
};

const screen: number[][] = Array(26).fill('').map(_ => []);

let ballX = 0;
let paddleX = 0;
let score = 0;

stdout.write('\x1b[2J\x1b[31m');

async function sleep (duration: number) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

async function main() {
    
    while(!machine.done){
	// debug(nextOp, machine.inputs);

	if (nextOp.value === "INPUT") {
	    machine.runtime.next();
	    debug('cheating');
	    if(ballX > paddleX) {
		debug('moving left');
		nextOp = machine.runtime.next(1);
	    } else if(ballX < paddleX) {
		debug('moving right');
		nextOp = machine.runtime.next(-1);
	    } else {
		debug('no move')
		nextOp = machine.runtime.next(0);
	    }
	    continue;
	}

	if (nextOp.value === "OUTPUT"){
	    debug('GOT OUTPUT');
	    const xFrame = machine.runtime.next();
	    let x = 0;
	    let y = 0;
	    let id = 0;
	    
	    debug(xFrame);
	    if(typeof xFrame.value == 'number'){
		// Handle outputs
		x = xFrame.value
	    }
	    machine.runtime.next();
	    const yFrame = machine.runtime.next();
	    debug(yFrame);
	    if(typeof yFrame.value == 'number'){
		// Handle outputs
		y = yFrame.value
	    }
	    machine.runtime.next();
	    const idFrame = machine.runtime.next();
	    debug(idFrame);
	    if(typeof idFrame.value == 'number'){
		// Handle outputs
		id = idFrame.value
	    }
	    
	    stdout.write(`\x1b[${y + 1};${x + 1}H`);

	    if(id == 0){
		stdout.write(' ');
	    }

	    if(id == 1){
		stdout.write('\u2588');
	    }

	    if(id == 2){
		stdout.write('\u25a0');
	    }
	    
	    if(id == 4){
		ballX = x;
		stdout.write('\u25cf');
	    }

	    if(id == 3){
		paddleX = x;
		stdout.write('\u25ac');
	    }

	    if(x == -1){
		score = id
	    } else {
		screen[y][x] = id;
	    }

	    stdout.write('\x1b[100;100H');
	    
	    await sleep(5);
	}
	
	if(nextOp.done){
	    machine.done = true;
	    break;
	}

	nextOp = machine.runtime.next();
    }

    console.log('remaining blocks', screen.map(row => row.filter(i => i == 2).length).reduce((a,b) => a + b))

    console.log('score', score)
}

main();
