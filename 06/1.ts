import { readFileSync } from 'fs'

const input = readFileSync('./input.txt').toString().split('\n').filter(i=>i);

interface IOrbit {
    satelites: string[];
}

const map: Map<string, IOrbit> = new Map();

input.forEach(entry => {
    const [focus, satelite] = entry.split(')');

    if(!focus || !satelite){
	throw new Error(`Bad entry: ${entry}`);
    }

    const existing = map.get(focus);

    if(existing){
	existing.satelites.push(satelite);
    } else {
	map.set(focus, {
	    satelites: [satelite],
	})
    }
})

// console.log(map);

const calculateOrbit = (focus: string, distance: number):number => {
    const orbits = map.get(focus);

    if(!orbits){
	return distance
    }

    return distance + orbits.satelites.reduce((sum, satelite) => {
	return sum + calculateOrbit(satelite, distance + 1);
    }, 0)
}

console.log(calculateOrbit('COM', 0));
