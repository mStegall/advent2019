import { readFileSync} from "fs"
import { exit, stdout } from "process"
import {emitKeypressEvents} from 'readline'
import { getMachine } from "../intcode/intcode";

const input = readFileSync("./15/input.txt").toString();

const machine = getMachine(input)

let nextOp: IteratorResult<number | "INPUT" | "OUTPUT" | undefined, void> = {
    value: undefined,
    done: false,
};

const screen: number[][] = Array(26).fill('').map(_ => []);

let x = 20;
let y = 20;

stdout.write('\x1b[2J\x1b[31m');

async function sleep (duration: number) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

const directionMap = new Map([
    ['up',1],
    [ 'down',2],
    [ 'right',4],
    [ 'left',3],
]);


emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

let listner : ((...params: any[]) => void) | null;

process.stdin.on('keypress', (_, key) => {
    if(typeof listner === 'function'){
	listner(key);
	listner = null;
    }
    
    if(key.ctrl && key.name === 'c') {
	process.exit(0);
    }
})

async function getKey(): Promise<{
    name: string;
}> {
    return new Promise(resolve => {
	listner = resolve
    });
}

let direction = 'up';
stdout.write(`\x1b[21;21HS`);
let ox: number| null;
let oy: number| null;

let count = 0;
async function main() {
    
    while(!machine.done){
	// debug(nextOp, machine.inputs);

	if (nextOp.value === "INPUT") {
	    machine.runtime.next();

	    while(true) {
		const key = await getKey();
		const directionCode = directionMap.get(key.name);

		if(directionCode) {
		    direction = key.name;
		    nextOp = machine.runtime.next(directionCode);
		    break;
		}
	    }
	    continue;
	}

	if (nextOp.value === "OUTPUT"){
	    const output = machine.runtime.next();
	    stdout.write(`\x1b[${y + 1};${x + 1}H`);

	    if( output.value == 0) {
		let wallX = x + (direction == 'left' ? -1 : direction == 'right' ? 1 : 0);
		let wallY = y + (direction == 'up' ? -1 : direction == 'down' ? 1 : 0);
		stdout.write(`\x1b[${wallY + 1};${wallX + 1}H`);
		stdout.write('#');
	    }

	    if( output.value == 1) {
		stdout.write('.');
		x += (direction == 'left' ? -1 : direction == 'right' ? 1 : 0);
		y += (direction == 'up' ? -1 : direction == 'down' ? 1 : 0);
		stdout.write(`\x1b[${y + 1};${x + 1}H`);
		stdout.write('D');
		count ++
	    }

	    if( output.value == 2) {
		stdout.write('.');
		x += (direction == 'left' ? -1 : direction == 'right' ? 1 : 0);
		y += (direction == 'up' ? -1 : direction == 'down' ? 1 : 0);
		ox = x;
		oy = y;
		stdout.write(`\x1b[${y + 1};${x + 1}H`);
		stdout.write('O');
	    }

	    stdout.write(`\x1b[21;21HS`);
	    if(ox && oy) {
		stdout.write(`\x1b[${oy + 1};${ox + 1}HO`);
	    }
	    
	    stdout.write(`\x1b[100;100H${count}`);
	    
	    await sleep(5);
	}
	
	if(nextOp.done){
	    machine.done = true;
	    break;
	}

	nextOp = machine.runtime.next();
    }
}

main();
