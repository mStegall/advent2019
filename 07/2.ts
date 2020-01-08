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
	    console.log('Waiting for input');
	    const input = yield;
	    console.log('Input', input);
	    if(typeof input != 'number'){
		throw new Error(`No input available`);
	    }
	    tape[tape[pc+1]] = input;
	    pc += 2;
	    break;

	case OUTPUT:
	    console.log('Outputing', tape[tape[pc+1]]);
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

console.log(orders.map(order => {
    const machines = order.map(i => {
	const runtime = runProgram(inputTape);
	const inputs = [i];

	return {
	    runtime,
	    inputs,
	}
    })

    machines[0].inputs.push(0);

    let finalOutput = 0;

    machines.forEach(i => i.runtime.next())
    
    let limitter = 0;
    const limit = 100;
    while(limitter < limit && finalOutput == 0){
	limitter ++;

	machines.forEach((machine, i) => {
	    console.log(machines.map(i => i.inputs));
	    const nextInput = machine.inputs.shift()
	    console.log(`Executing machine ${i}, next input ${nextInput}`);
    	    let nextFrame = machine.runtime.next(nextInput);
	    console.log(nextFrame);
	    if(typeof nextFrame.value == 'number'){
		const setMachineIndex = i === machines.length - 1 ? 0: i + 1;
		console.log(`Setting output to machine ${setMachineIndex}`);
		machines[setMachineIndex].inputs.push(nextFrame.value);
		machine.runtime.next();
	    }

	    if(nextFrame.done){
		machine.inputs.push(nextInput || 0);
		if(i === machines.length - 1){
		    const machine0LastInput = machines[0].inputs.shift()
		    if( typeof machine0LastInput === "undefined"){
			throw new Error("Finished with no Ouput");
		    }
		finalOutput = machine0LastInput;
		}
	    }
	    console.log('')
	})
    }

    if(limitter == limit){
	throw new Error('Hit execution limit')
    }

    return finalOutput;
}).reduce((a,b) => Math.max(a,b), 0))

