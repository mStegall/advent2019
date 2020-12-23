import { readFileSync } from 'fs';
import { deepEqual } from 'assert';

const input = readFileSync('./input.txt').toString();

// Reduce coordinates to simple ratios, any coordinates including a zero component are reduced to units
const reduceCoords = (x:number, y:number): [number, number] => {
    if(x === 0){
	return [0,y/Math.abs(y)]
    }

    if(y===0){
	return [x/Math.abs(x),0]
    }
    
    for(let i = 2; i <= Math.abs(x); i ++) {
	if(x % i === 0 && y % i === 0){
	    return reduceCoords(x / i, y / i);
	}
    }

    return [x, y]    
}

// Determine asteroid with best visibility and number of asteroids visible
const getBestMonitor = (input:string) => {
    const asteroidCoords: Set<[number, number]> = new Set();

    input.split('\n').forEach((row, y) => {
        row.split('').forEach((char, x) => {
            if(char === '#'){
            asteroidCoords.add([x,y]);
            }
        })
    })

    const asteroidArray = Array.from(asteroidCoords.keys());

    return asteroidArray.map(([x,y]) => {
	const visibleRatios: Set<string> = new Set();

	asteroidArray.forEach(([a,b]) => {
	    if(a == x && b == y) {
            console.log('test')
            return
        }
        const [dx,dy] = reduceCoords(a-x, b-y)

	    visibleRatios.add(`${dx}:${dy}`);
	})

	return {
	    coords: [x,y],
	    count: visibleRatios.size,
	}
    }).reduce((a,b) => a.count > b.count ? a : b)
}

// Tests cases
const tests = [
    {
	file: 'test1.txt',
	coords: [5,8],
	count: 33,
    },
    {
	file: 'test2.txt',
	coords: [3,4],
	count: 8,
    },
    {
	file: 'test3.txt',
	coords: [1,2],
	count: 35,
    },
    {
	file: 'test4.txt',
	coords:[11,13],
	count: 210,
    }
];

tests.forEach(test => {
    const { coords, count} = getBestMonitor(readFileSync(`./${test.file}`).toString());

    deepEqual(coords, test.coords);
    deepEqual(count, test.count);
    console.log(`${test.file} passed`);
})

console.log(getBestMonitor(input));
