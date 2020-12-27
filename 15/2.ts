import { readFileSync } from "fs"
import { exit, stdout } from "process"
import { emitKeypressEvents } from 'readline'

const input = readFileSync("./15/input.txt").toString();

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

const padInstruction = (instruction: string) => {
	return Array(5 - instruction.length).fill('0').join('') + instruction
}

const getParamPos = (tape: number[], mode: string, pos: number, base: number) => {
	switch (mode) {
		case '0':
			return tape[pos];
		case '1':
			return pos;
		case '2':
			debug(`Rel pos: ${tape[pos] + base}`);
			return tape[pos] + base;
		default:
			throw new Error(`Bad addressing mode: ${mode}`);
	}
}

const getParam = (tape: number[], mode: string, pos: number, base: number) => {
	return tape[getParamPos(tape, mode, pos, base)] || 0;
};

function* runProgram(tape: number[]) {
	tape = [...tape];

	let pc = 0;
	let i = 0;
	let relativeBase = 0;

	while (i < 1000000) {
		i++

		const instruction = tape[pc];
		const [mode3, mode2, mode1, ...opCodeDigits] = padInstruction(instruction.toString()).split('')
		const opCode = parseInt(opCodeDigits.join(''));

		const param1 = getParam(tape, mode1, pc + 1, relativeBase);
		const param2 = getParam(tape, mode2, pc + 2, relativeBase);
		const param3Pos = getParamPos(tape, mode3, pc + 3, relativeBase);

		debug(`OpCode: ${opCode}; Params: [${param1},${param2}]; Modes: [${mode1},${mode2}]; [${tape[pc + 1]},${tape[pc + 2]},${tape[pc + 3]}]`)

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
				if (typeof input != 'number') {
					throw new Error(`No input available`);
				}
				tape[getParamPos(tape, mode1, pc + 1, relativeBase)] = input;
				pc += 2;
				break;

			case OUTPUT:
				debug('Outputing', param1);
				yield "OUTPUT";
				yield param1;
				pc += 2;
				break;

			case JIT:
				if (param1) {
					pc = param2;
				} else {
					pc += 3;
				}
				break;

			case JIF:
				if (!param1) {
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

			default:
				debug('wat')
				throw new Error(`Unrecognized OpCode:${opCode}`);
		}
	}

	throw new Error(`Hit max iterations`)
}

const inputTape = input.split(',').map(i => parseInt(i));

const debug = (...params: any) => {
	// console.log(...params)
}

const runtime = runProgram(inputTape);
const machine = {
	runtime,
	done: false,
}

let nextOp: IteratorResult<number | "INPUT" | "OUTPUT" | undefined, void> = {
	value: undefined,
	done: false,
};

let x = 25;
let y = 25;

stdout.write('\x1b[2J\x1b[31m');

async function sleep(duration: number) {
	return new Promise(resolve => setTimeout(resolve, duration));
}

const directionMap = new Map([
	['up', 1],
	['down', 2],
	['right', 4],
	['left', 3],
]);


emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

let listner: ((...params: any[]) => void) | null;

process.stdin.on('keypress', (_, key) => {
	if (typeof listner === 'function') {
		listner(key);
		listner = null;
	}

	if (key.ctrl && key.name === 'c') {
		process.exit(0);
	}
})

let directions = ['up', 'right', 'down', 'left']
let directionI = 0
let direction = 'up';
stdout.write(`\x1b[26;26HS`);
let ox: number | null;
let oy: number | null;

let count = 0;

const screen: {
	[key: number]: {
		[key: number]: boolean
	},
} = {}

for (let i = 0; i < 50; i++){
	screen[i]={}
}

screen[25][25]=true;

async function main() {

	while (!machine.done) {
		// debug(nextOp, machine.inputs);

		if (nextOp.value === "INPUT") {
			machine.runtime.next();

			// while(true) {
			// const key = await getKey();
			// const directionCode = directionMap.get(key.name);

			// if(directionCode) {
			//     direction = key.name;
			await sleep(10)
			nextOp = machine.runtime.next(directionMap.get(direction));
			//     break;
			// }
			// }
			// continue;
		}

		if (nextOp.value === "OUTPUT") {
			debug('GOT OUTPUT');
			const output = machine.runtime.next();
			stdout.write(`\x1b[${y + 1};${x + 1}H`);

			// wall
			if (output.value == 0) {
				let wallX = x + (direction == 'left' ? -1 : direction == 'right' ? 1 : 0);
				let wallY = y + (direction == 'up' ? -1 : direction == 'down' ? 1 : 0);
				stdout.write(`\x1b[${wallY + 1};${wallX + 1}H`);
				stdout.write('#');
				directionI ++
				directionI %= 4
				direction = directions[directionI]
			}

			// successful move
			if (output.value == 1) {
				stdout.write('.');
				x += (direction == 'left' ? -1 : direction == 'right' ? 1 : 0);
				y += (direction == 'up' ? -1 : direction == 'down' ? 1 : 0);
				stdout.write(`\x1b[${y + 1};${x + 1}H`);
				stdout.write('D');
				count++
				screen[x][y] = true
				directionI --
				directionI = directionI >=0 ? directionI :3
				direction = directions[directionI]
			}

			// vent
			if (output.value == 2) {
				stdout.write('.');
				x += (direction == 'left' ? -1 : direction == 'right' ? 1 : 0);
				y += (direction == 'up' ? -1 : direction == 'down' ? 1 : 0);
				ox = x;
				oy = y;
				stdout.write(`\x1b[${y + 1};${x + 1}H`);
				stdout.write('O');
			}

			stdout.write(`\x1b[26;26HS`);
			if (ox && oy) {
				stdout.write(`\x1b[${oy + 1};${ox + 1}HO`);
			}

			if (x == 25 && y == 25 && count) {
				machine.done = true
				count = 0
			}

			stdout.write(`\x1b[100;100H${count}`);
		}

		if (nextOp.done) {
			machine.done = true;
			break;
		}

		nextOp = machine.runtime.next();
	}

	stdout.write(`\x1b[100;100H     `);

	if (!ox || !oy){
		throw new Error("didn't find oxygen")
	}

	let candidates: [number,number][] = [[ox,oy]]
	
	while (candidates.length > 0){
		stdout.write(`\x1b[100;100H${count}`);

		let newCandidates: [number,number][] =[]

		candidates.forEach(([x,y])=> {
			[[0,1],[0,-1],[1,0],[-1,0]].forEach(([dx,dy]) => {
				if(screen[x+dx][y+dy]){
					screen[x+dx][y+dy] = false
					newCandidates.push([x+dx,y+dy])
					stdout.write(`\x1b[${y +dy+ 1};${x+dx + 1}HO`);
				}
			})
		})

		candidates = newCandidates

		count ++
		
		await sleep(25)

	}
}

main();
