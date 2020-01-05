import { readFileSync} from "fs"
import { exit } from "process"

const input = readFileSync("./input.txt").toString();

const FINISH = 99;
const ADD = 1;
const MULTIPLY = 2;
const INPUT = 3;
const OUTPUT = 4;

const applyAdd = (posA:number, posB:number, posOut:number, tape: number[]) => {
    const valueA = tape[posA];
    const valueB = tape[posB];

    const result = [...tape];

    result[posOut] = valueA + valueB;

    return result;
}

const applyMult = (posA:number, posB:number, posOut:number, tape: number[]) => {
    const valueA = tape[posA];
    const valueB = tape[posB];

    const result = [...tape];

    result[posOut] = valueA * valueB;

    return result;
}

const padInstruction = (instruction:string) => {
    return Array(5-instruction.length).fill('0').join('') + instruction
}

const runProgram = (tape:number[]) => {
    tape = [...tape];
    
    let pc = 0;
    let i = 0;
    
    while(i < 100000){
	i ++

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
	    tape[tape[pc+1]] = 1;
	    pc += 2;
	    break;

	case OUTPUT:
	    console.log(tape[tape[pc+1]]);
	    pc += 2;
	    break;
	case FINISH:
	    console.log('Finished');
	    return tape;
	default :
	    throw new Error(`Unrecognized OpCode:${opCode}`);
	}
    }
}

const inputTape = input.split(',').map(i => parseInt(i));

runProgram(inputTape);






