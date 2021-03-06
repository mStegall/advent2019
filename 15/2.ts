import { readFileSync } from "fs"
import { stdout } from "process"
import { getMachine, machineRuntime } from "../intcode/intcode";

const input = readFileSync("./15/input.txt").toString();
const machine = getMachine(input)

let nextOp: ReturnType<machineRuntime["next"]> = {
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

let directions = ['up', 'right', 'down', 'left']
let directionI = 0
let direction = 'up';
stdout.write(`\x1b[25;25HS`);
let ox: number | null;
let oy: number | null;

let count = 0;

const screen: {
	[key: number]: {
		[key: number]: boolean
	},
} = {}

for (let i = 0; i < 50; i++) {
	screen[i] = {}
}

screen[25][25] = true;

async function main() {
	while (!machine.done) {
		if (nextOp.value === "INPUT") {
			// await sleep(10)
			machine.runtime.next();
			nextOp = machine.runtime.next(directionMap.get(direction));
		}

		if (nextOp.value === "OUTPUT") {
			const output = machine.runtime.next();
			stdout.write(`\x1b[${y};${x}H`);

			// wall
			if (output.value == 0) {
				let wallX = x + (direction == 'left' ? -1 : direction == 'right' ? 1 : 0);
				let wallY = y + (direction == 'up' ? -1 : direction == 'down' ? 1 : 0);
				stdout.write(`\x1b[${wallY};${wallX}H#`);
				directionI++
				directionI %= 4
				direction = directions[directionI]
			}

			// successful move
			if (output.value == 1) {
				stdout.write('.');
				x += (direction == 'left' ? -1 : direction == 'right' ? 1 : 0);
				y += (direction == 'up' ? -1 : direction == 'down' ? 1 : 0);
				stdout.write(`\x1b[${y};${x}HD`);
				count++
				screen[x][y] = true
				directionI--
				directionI = directionI >= 0 ? directionI : 3
				direction = directions[directionI]
			}

			// vent
			if (output.value == 2) {
				stdout.write('.');
				x += (direction == 'left' ? -1 : direction == 'right' ? 1 : 0);
				y += (direction == 'up' ? -1 : direction == 'down' ? 1 : 0);
				ox = x;
				oy = y;
				stdout.write(`\x1b[${y};${x}HO`);
			}

			stdout.write(`\x1b[25;25HS`);

			if (ox && oy) {
				stdout.write(`\x1b[${oy};${ox}HO`);
			}

			if (x == 25 && y == 25 && count) {
				count = 0
				break;
			}

			stdout.write(`\x1b[100;100H${count}`);
		}

		if (nextOp.done) {
			break;
		}

		nextOp = machine.runtime.next();
	}

	stdout.write(`\x1b[100;100H     `);

	if (!ox || !oy) {
		throw new Error("didn't find oxygen")
	}

	let candidates: [number, number][] = [[ox, oy]]

	while (candidates.length > 0) {
		stdout.write(`\x1b[100;100H${count}`);

		let newCandidates: [number, number][] = []

		candidates.forEach(([x, y]) => {
			[[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dx, dy]) => {
				if (screen[x + dx][y + dy]) {
					screen[x + dx][y + dy] = false
					newCandidates.push([x + dx, y + dy])
					stdout.write(`\x1b[${y + dy};${x + dx}HO`);
				}
			})
		})

		candidates = newCandidates

		count++

		await sleep(25)
	}
}

main();
