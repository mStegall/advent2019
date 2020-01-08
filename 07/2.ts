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

const padInstruction = (instruction:string) => {
    return Array(5-instruction.length).fill('0').join('') + instruction
}

function* runProgram (tape:number[]) {
    tape = [...tape];
    
    let pc = 0;
    let i = 0;
    
    while(i < 10000){
	i ++

	const instruction = tape[pc];
	const [mode3, mode2, mode1, ...opCodeDigits] = padInstruction(instruction.toString()).split('')
	const opCode = parseInt(opCodeDigits.join(''));

	const param1 = mode1 !== '0' ? tape[pc+1] : tape[tape[pc+1]];
	const param2 = mode2 !== '0' ? tape[pc+2] : tape[tape[pc+2]];
	const param3 = mode3 !== '0' ? tape[pc+3] : tape[tape[pc+3]];
	
	switch (opCode) {
	case ADD:
	    // console.log('add');
	    tape[tape[pc+3]] = param1 + param2;
	    pc += 4;
	    break;
	    
	case MULTIPLY:
	    tape[tape[pc+3]] = param1 * param2;
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
	    tape[tape[pc+1]] = input;
	    pc += 2;
	    break;

	case OUTPUT:
	    debug('Outputing', tape[tape[pc+1]]);
	    yield "OUTPUT";
	    yield tape[tape[pc+1]];
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
	    tape[tape[pc+3]] = param1 < param2 ? 1 : 0;
	    pc += 4;
	    break;

	case EQ:
	    tape[tape[pc+3]] = param1 === param2 ? 1 : 0;
	    pc += 4;
	    break;
	    	    
	    
	case FINISH:
	    return;

	default :
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


    
const orders = permute([], [6,7,8,9,5]);

const debug = (...params:any) => {

    // console.log(...params)
}

console.log(orders.map(order => {
    const machines = order.map(i => {
	const runtime = runProgram(inputTape);
	const inputs = [i];

	return {
	    runtime,
	    inputs,
	    lastOutput: 0,
	    waitingOnInput: false,
	    done: false,
	}
    })

    machines[0].inputs.push(0);

    let finalOutput = 0;

    let limitter = 0;
    const limit = 10000;
    while(limitter < limit && !machines[4].done){
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
			const setMachineIndex = i === machines.length - 1 ? 0: i + 1;
			debug(`Setting output to machine ${setMachineIndex}`);
			machines[setMachineIndex].inputs.push(nextFrame.value);
		    }
		}
		
		if(nextOp.done){
		    machine.done = true;
		    return;
		}

		nextOp =  machine.runtime.next();
	    }
	})
    }

    if(limitter == limit){
	throw new Error(`Hit execution limit ${limit}`)
    }

    return machines[4].lastOutput;
}).reduce((a,b) => Math.max(a,b), 0))

