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

const runProgram = (tape:number[], inputArray:number[]) => {
    tape = [...tape];
    const outputs = [];
    // console.log(inputArray);
    
    let pc = 0;
    let i = 0;
    
    while(i < 10000){
	i ++
	// console.log(tape.join(''));
	const instruction = tape[pc];
	const [mode3, mode2, mode1, ...opCodeDigits] = padInstruction(instruction.toString()).split('')
	const opCode = parseInt(opCodeDigits.join(''));

	// console.log(opCode, mode1, mode2, mode3);

	const param1 = mode1 !== '0' ? tape[pc+1] : tape[tape[pc+1]];
	const param2 = mode2 !== '0' ? tape[pc+2] : tape[tape[pc+2]];
	const param3 = mode3 !== '0' ? tape[pc+3] : tape[tape[pc+3]];
	
	// console.log(opCode, param1, param2, param3);
	
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
	    const input = inputArray.shift();
	    if(typeof input != 'number'){
		throw new Error(`No input available`);
	    }
	    tape[tape[pc+1]] = input;
	    pc += 2;
	    break;

	case OUTPUT:
	    // console.log(tape[tape[pc+1]]);
	    outputs.push(tape[tape[pc+1]]);
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
	    // console.log('Finished');
	    return [tape, outputs];
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


    
const orders = permute([], [0,1,2,3,4]);

console.log(orders.map(order => {
    return order.reduce((acc, i) => {
	const [ , outputs] = runProgram(inputTape, [i, acc]);

	if(outputs.length != 1 ){
	    throw new Error(`Incorrect number of outputs ${outputs.length}`);
	}

	return outputs[0];
    }, 0)
}).reduce((a,b) => Math.max(a,b), 0))

