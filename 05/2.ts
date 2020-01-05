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

const runProgram = (tape:number[], input:number) => {
    tape = [...tape];
    
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
	    // console.log('input');
	    tape[tape[pc+1]] = input;
	    pc += 2;
	    break;

	case OUTPUT:
	    console.log(tape[tape[pc+1]]);
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
	    console.log('Finished');
	    return tape;
	default :
	    throw new Error(`Unrecognized OpCode:${opCode}`);
	}
    }

    throw new Error(`Hit max iterations`)
}

const inputTape = input.split(',').map(i => parseInt(i));

runProgram(inputTape,5);

// runProgram([3,9,8,9,10,9,4,9,99,-1,8], 8)
// runProgram([3,9,8,9,10,9,4,9,99,-1,8], 9)
// runProgram([3,3,1108, -1,8,3,4,3,99], 8)
// runProgram([3,3,1108, -1,8,3,4,3,99], 9)

// runProgram([3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9], 1)
// runProgram([3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9], 0)
