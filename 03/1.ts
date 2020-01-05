import { readFileSync } from 'fs'

const input = readFileSync("./input.txt").toString();

const mapWire = (wirePath: string[]) => {
    const map:Set<string> = new Set();

    let x = 0;
    let y = 0;
    
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
	    
	    map.add(`${x}:${y}`);
	}
	
    }

    return map;
}

const wires = input.split('\n').map(wireString => wireString.split(','));
const wireMaps = wires.map(mapWire);

const intersections: Set<string> = new Set();

wireMaps[0].forEach(entry => {
    if(wireMaps[1].has(entry)){
	intersections.add(entry);
    }
})

console.log(Array.from(intersections.values()).map((intersection:string) => {
    const [x, y] = intersection.split(':');

    return Math.abs(parseInt(x)) + Math.abs(parseInt(y));
}).reduce((a:number, b:number) => Math.min(a,b)));
