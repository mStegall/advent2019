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

for(let i = 0; i < 1000; i ++){
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

    const state = moons.map(i => `${i.x},${i.y},${i.z},${i.dx},${i.dy},${i.dz}`).join(':');

    
}

console.log(moons.map(moon => {
    return (Math.abs(moon.x) + Math.abs(moon.y) + Math.abs(moon.z))
	* (Math.abs(moon.dx) + Math.abs(moon.dy) + Math.abs(moon.dz))
}).reduce((a,b) => a+b))
