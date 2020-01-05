import { readFileSync} from "fs"
import { exit } from "process"

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

const testInputs = (noun:number, verb:number) => {
    inputTape[1] = noun;
    inputTape[2] = verb;

    const outputTape = runProgram(inputTape);

    return outputTape[0];
}

for (let noun = 0; noun <= 99; noun ++) {
    for (let verb = 0; verb <= 99; verb ++) {
	if(testInputs(noun, verb) === 19690720){
	    console.log(100 * noun + verb);
	    exit(0);
	}
    }
}




