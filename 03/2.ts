import { readFileSync } from 'fs'

const input = readFileSync("./input.txt").toString();

const mapWire = (wirePath: string[]) => {
    const map:Map<string, number> = new Map();

    let x = 0;
    let y = 0;
    let step = 0;
    
    for(let segment of wirePath) {
	const direction = segment[0];
	const length = parseInt(segment.slice(1));
	for(let i = 0; i < length; i ++){
	    switch (direction){
	    case 'U':
		y ++;
		break;
	    case 'D':
		y --;
		break;
	    case 'L':
		x --;
		break;
	    case 'R':
		x ++;
		break;
	    }

	    step ++;
	    
	    map.set(`${x}:${y}`, step);
	}
	
    }

    return map;
}

const wires = input.split('\n').map(wireString => wireString.split(','));
const wireMaps = wires.map(mapWire);
const [wireA, wireB] = wireMaps;

const intersections: Map<string, number> = new Map();

wireA.forEach((steps,coords) => {
    if(wireB.has(coords)){
	intersections.set(coords, steps + (wireB.get(coords) || 0));
    }
})

console.log(Array.from(intersections.values()).reduce((a:number, b:number) => Math.min(a,b)));

