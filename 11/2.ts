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

while(!machine.done){

    // debug(nextOp, machine.inputs);

    if (nextOp.value === "INPUT") {
	// Determine next input
	const nextInput = hullMap.get(`${x}:${y}`) || 0;
	debug('1', machine.runtime.next());
	debug(`Providing input ${nextInput}`);
    	nextOp =  machine.runtime.next(nextInput);
	continue;
    }

    if (nextOp.value === "OUTPUT"){
	debug('GOT OUTPUT');
	const paintFrame = machine.runtime.next();
	debug(paintFrame);
	if(typeof paintFrame.value == 'number'){
	    // Handle outputs
	    if([0,1].includes(paintFrame.value )){
		hullMap.set(`${x}:${y}`, (paintFrame.value as 0|1))
		paintedPanels.add(`${x}:${y}`)
	    }
	}

	machine.runtime.next();

	const turnFrame = machine.runtime.next();
	debug(turnFrame);
	if(typeof turnFrame.value == 'number'){
	    // Handle outputs
	    if([0,1].includes(turnFrame.value )){
		if(turnFrame.value === 0){
		    direction --;
		    if(direction < 0) direction = 3;
		} else {
		    direction ++;
		    if(direction > 3) direction = 0;
		}
	    }
	}

	switch (direction) {
	case 0:
	    y ++;
	    break;
	case 1:
	    x ++;
	    break;
	case 2:
	    y --;
	    break;
	case 3:
	    x --;
	    break;
	}

    }
    
    if(nextOp.done){
	machine.done = true;
	break;
    }

    nextOp = machine.runtime.next();
}

console.log(hullMap)

const rendered = Array(7)
      .fill('')
      .map((_, i) =>
	   Array(50)
	   .fill('')
	   .map((_, j) =>{
	       // console.log(`${j}:${0-i}`)
	       return hullMap.get(`${j}:${0-i}`) ? 'X' : ' '
	   })
	   .join('')
	  ).join('\n');

console.log(rendered)
