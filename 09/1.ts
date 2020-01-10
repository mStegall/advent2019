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

const machines = [2].map(i => {
    const runtime = runProgram(inputTape);
    const inputs = [i];
    const outputs: number[] = [];
    
    return {
	runtime,
	inputs,
	outputs,
	lastOutput: 0,
	waitingOnInput: false,
	done: false,
    }
})

let limitter = 0;
const limit = 10000;
while(limitter < limit && !machines[machines.length - 1].done){
    limitter ++;

    machines.forEach((machine, i) => {
	debug(machines.map(i => i.inputs));
	debug('')

	let nextOp: IteratorResult<number | "INPUT" | "OUTPUT" | undefined, void> = {
	    value: undefined,
	    done: false,
	};
	
	if(machine.waitingOnInput && machine.inputs.length) {
	    const nextInput = machine.inputs.shift()
	    debug('1', machine.runtime.next());
	    debug(`Providing input ${nextInput}`);
    	    nextOp = machine.runtime.next(nextInput);
	    machine.waitingOnInput = false;
	}

	
	while(!machine.waitingOnInput && !machine.done){

	    debug(nextOp, machine.inputs);

	    if (nextOp.value === "INPUT") {
		if(machine.inputs.length === 0){
		    machine.waitingOnInput = true;
		    break;
		};
		const nextInput = machine.inputs.shift()
		debug('1', machine.runtime.next());
		debug(`Providing input ${nextInput}`);
    		nextOp =  machine.runtime.next(nextInput);
		continue;
	    }

	    if (nextOp.value === "OUTPUT"){
		debug('GOT OUTPUT');
		const nextFrame = machine.runtime.next();
		debug(nextFrame);
		if(typeof nextFrame.value == 'number'){
		    machine.lastOutput = nextFrame.value;
		    machine.outputs.push(nextFrame.value);
		}
	    }
	    
	    if(nextOp.done){
		machine.done = true;
		return;
	    }

	    nextOp = machine.runtime.next();
	}
    })
}

console.log(machines[0].outputs);

if(limitter == limit){
    throw new Error(`Hit execution limit ${limit}`)
}



