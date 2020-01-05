import { readFileSync} from "fs"

const input = readFileSync("./input.txt").toString();

const FINISH = 99;
const ADD = 1;
const MULTIPLY = 2;

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

const runProgram = (tape:number[]) => {
    let pc = 0;
    
    while(true){
	const opCode = tape[pc]
	switch (opCode) {
	case ADD:
	    tape = applyAdd(tape[pc+1],tape[pc+2],tape[pc+3],tape);
	    break;
	case MULTIPLY:
   	    tape = applyMult(tape[pc+1],tape[pc+2],tape[pc+3],tape);
	    break;
	case FINISH:
	    return tape;
	}
	pc += 4;
    }
}

const inputTape = input.split(',').map(i => parseInt(i));
inputTape[1] = 12;
inputTape[2] = 2;

const outputTape = runProgram(inputTape);

console.log(outputTape[0]);
