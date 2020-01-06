import { readFileSync } from 'fs'

const input = readFileSync('./input.txt').toString().split('\n').filter(i=>i);

interface IOrbit {
    name: string;
    satelites: string[];
    distance: number;
    hasSam: boolean;
    hasYou: boolean;
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
	    name: focus,
	    satelites: [satelite],
	    distance: 0,
	    hasSam: false,
	    hasYou: false,
	})
    }
})

// console.log(map);

const calculateOrbit = (focus: string, distance: number): [number, boolean, boolean] => {
    const orbits = map.get(focus);

    if(!orbits){
	return [distance, false, false];
    }

    orbits.distance = distance;

    const count = distance + orbits.satelites.reduce((sum, satelite) => {
	let [satCount, hasSam, hasYou] = calculateOrbit(satelite, distance + 1);

	orbits.hasSam = hasSam || orbits.hasSam;
	orbits.hasYou = hasYou || orbits.hasYou;
	
	return sum + satCount;
    }, 0)

    if(orbits.satelites.includes('SAN')){
	console.log('found sam');
	orbits.hasSam = true;
    }

    if(orbits.satelites.includes('YOU')){
	orbits.hasYou = true;
    }
    
    return [count, orbits.hasSam, orbits.hasYou];
}

calculateOrbit('COM', 0);

const samFocus = Array.from(map.values()).filter(i => i.hasSam).reduce((acc, orbit) => {
    return acc.distance < orbit.distance ? orbit : acc;
});

const youFocus = Array.from(map.values()).filter(i => i.hasYou).reduce((acc, orbit) => {
    return acc.distance < orbit.distance ? orbit : acc;
});

const gco = Array.from(map.values()).filter(i => i.hasSam && i.hasYou).reduce((acc, orbit) => {
    return acc.distance < orbit.distance ? orbit : acc;
});

console.log((samFocus.distance - gco.distance) + (youFocus.distance - gco.distance));

