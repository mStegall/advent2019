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

const getDistance = (dx: number, dy: number) => {
    return Math.sqrt(dx * dx + dy * dy);
};

const parseInput = (input: string) => {
    const asteroidCoords: Set<[number, number]> = new Set();

    input.split('\n').forEach((row, y) => {
	row.split('').forEach((char, x) => {
	    if(char === '#'){
		asteroidCoords.add([x,y]);
	    }
	})
    })

    return Array.from(asteroidCoords.keys());
}

// Determine asteroid with best visibility and number of asteroids visible
const getBestMonitor = (input:string) => {
    const asteroidArray = parseInput(input);
    
    return asteroidArray.map(([x,y]) => {
	const visibleRatios: Set<string> = new Set();

	asteroidArray.forEach(([a,b]) => {
	    if(a == x && b == y) {
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

const convertRatio = (ratio: string) => {
    const [x, y] = ratio.split(':').map(i =>  parseInt(i));
    if(typeof x === 'number' && typeof y === 'number') {
	if(x < 0) {
	    return (1 -y/getDistance(x,y)) + 1;
	}

	return y/getDistance(x,y);
    }

    throw new Error(`Bad ratio format: ${ratio}`)
};

const leftPad = (i: number) => {
    return [...Array(3-i.toString().length).fill(' '), i.toString()].join('')
};

const get200th = (input:string):[number,number] => {
    const {coords} =  getBestMonitor(input);
    const [x,y] = coords;

    console.log(x,y)

    const asteroidArray = parseInput(input);

    const ratioMap: Map<string, {
	coords: [number, number],
	distance: number,
    }[]> = new Map()
    
    asteroidArray.forEach(([a,b]) => {
	if(a == x && b == y) {
	    return
	}
	const [dx,dy] = reduceCoords(a-x, b-y)
	const ratio = `${dx}:${dy}`

	if(ratioMap.has(ratio)){
	    ratioMap.get(ratio)?.push({
		coords: [a,b],
		distance: getDistance(a-x,b-y),
	    })
	} else {
	    ratioMap.set(ratio, [{
		coords: [a,b],
		distance: getDistance(a-x,b-y),
	    }])
	};
    })

    const sortedAngled = Array.from(ratioMap.entries()).map(([k, v]): [string, {
	coords: [number, number],
	distance: number,
    }[]] => {
	return [k, v.sort((a,b) => a.distance > b.distance ? 1:-1)];
    }).sort((a,b) => {
	return convertRatio(a[0] as string) > convertRatio(b[0] as string) ? 1 : -1;
    }).map(([k, v]) => v);

    let i = 0;
    const row = Array(40).fill('.')
    const map = Array(60).fill('.').map(i => [...row]);
    map[y][x] = 'X';

    for(let j = 0; sortedAngled.length; j++){
	console.log(i, sortedAngled[i]);
	const destroyed = sortedAngled[i].shift();
	if(!destroyed){
	    throw new Error('what');
	}


	const [x,y] = destroyed?.coords;
	console.log(`Destroyed ${x},${y}`);
	
	map[y][x] = j;
	
	if(sortedAngled[i].length == 0) {
	    sortedAngled.splice(i, 1);
	} else {
	    i ++; 
	}

	console.log(sortedAngled.length, i);
	if(i >= sortedAngled.length - 1) {
	    i = 0;
	}

    }

    console.log(map.map(i => i.map(i => leftPad(i)).join(' ')).join('\n'));

    const lastCoords = sortedAngled[i][0].coords;

    if(!lastCoords){
	throw new Error('aaaa');
    }

    return lastCoords;
}

// Tests cases
const tests = [
    {
	file: 'test4.txt',
	result: [8,2],
    }
];

// tests.forEach(test => {
//     const coords = get200th(readFileSync(`./${test.file}`).toString());

//     deepEqual(coords, test.result);

//     console.log(`${test.file} passed`);
// })


console.log(get200th(input));
