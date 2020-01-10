import { readFileSync } from 'fs'

const input = readFileSync('./input.txt').toString().split('\n')[0];

const parseLayers = (input: string, x:number, y:number) => {
    let values = input.split('').map(i => parseInt(i));
    const layers = [];

    const layerLength = x * y;
    
    while(values.length){
	layers.push(values.slice(0, layerLength));
	values.splice(0, layerLength);
    }

    return layers;
}

const countDigits = (layer: number[]) => {
    const count = {
	0: 0,
	1: 0,
	2: 0,
	3: 0,
	4: 0,
	5: 0,
	6: 0,
	7: 0,
	8: 0,
	9: 0,
    }

    layer.forEach(i => { (count[(i as 1 | 2 | 0)]) ++ });

    return count;
}

const foundLayer = parseLayers(input, 25, 6).map(layer => {
    return {
	layer,
	counts: countDigits(layer),
    }
}).reduce((acc, layer) => layer.counts[0] > acc.counts[0] ?  acc : layer)

// console.log(foundLayer)

console.log(foundLayer.counts[1] * foundLayer.counts[2]);
