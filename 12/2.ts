import { readFileSync } from 'fs'

const input = readFileSync('./input.txt').toString();

const parseInput = (input: string) => {
    const lines = input.split('\n').filter( i => i);
    const format = /<x=([\-[0-9]*), y=([\-[0-9]*), z=([\-[0-9]*)>/
    return lines.map(line=> {
	const result =  format.exec(line)
	if(!result){
	    throw new Error(`Bad input format`);
	}
	const [_, x,y,z] = result;

	return {
	    x: parseInt(x),
	    y: parseInt(y),
	    z: parseInt(z),
	    dx: 0,
	    dy: 0,
	    dz: 0,
	}
    })
}


const moons = parseInput(input)
const pairs = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]].map(([a,b]) => {
    return [moons[a], moons[b]]
});

const states: Set<string> = new Set();
const statesY: Set<string> = new Set();
const statesZ: Set<string> = new Set();

let xCycle = 0;
let yCycle = 0;
let zCycle = 0;

for(let i = 0; !(xCycle && yCycle && zCycle) ; i ++){
    pairs.forEach(([a,b]) => {
	if(a.x < b.x) {
	    a.dx ++;
	    b.dx --;
	} else if(a.x > b.x){
	    a.dx --;
	    b.dx ++;
	}

	if(a.y < b.y) {
	    a.dy ++;
	    b.dy --;
	} else if(a.y > b.y){
	    a.dy --;
	    b.dy ++;
	}

	if(a.z < b.z) {
	    a.dz ++;
	    b.dz --;
	} else if(a.z > b.z){
	    a.dz --;
	    b.dz ++;
	}
    })

    moons.forEach(moon => {
	moon.x += moon.dx;
	moon.y += moon.dy;
	moon.z += moon.dz;
    })

    const stateX = moons.map((moon,i) => moon.x*1000+moon.dx).join(':');
    
    if(!xCycle && states.has(stateX)){
	console.log(`Found x cycle ${i}`)
	xCycle = i;
    } else {
	states.add(stateX);
    }

    const stateY = moons.map((moon,i) => moon.y*1000+moon.dy).join(':');
    
    if(!yCycle && statesY.has(stateY)){
	console.log(`Found y cycle ${i}`)
	yCycle = i;
    } else {
	statesY.add(stateY);
    }

    const stateZ = moons.map((moon,i) => moon.z*1000+moon.dz).join(':');
    
    if(!zCycle && statesZ.has(stateZ)){
	console.log(`Found z cycle ${i}`)
	zCycle = i;
    } else {
	statesZ.add(stateZ);
    }


}

const lcm = (...params :number[]): number => {
    const max = params.reduce((a,b) => Math.max(a,b));
    for(let i = 2; i < max; i ++){
	if(params.every(j => j % i === 0)){
	    console.log(`found multiple ${i}`)
	    const reduced = params.map(j => j / i);
	    console.log(`Reduced to: ${reduced}`);
	    return i * lcm(...reduced);
	}
    }

    return params.reduce((a,b) => a*b);
}

console.log(lcm(xCycle, zCycle,yCycle));
