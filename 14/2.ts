import { readFileSync } from 'fs'

interface reaction {
    amount: number;
    inputs: [string, number][];
}

interface resourceMap {
    [key:string]: number,
}

const calculateCost = (input:string, fuelTarget = 1,haveMap:resourceMap = {} ): [number,resourceMap]  => {
    const reactionMap: {
	[key:string]: reaction
    }= {};

    input.split('\n').filter(i=>i).forEach(line => {
	const [inputString, outputTerm] = line.split('=>');

	const [amount, compound] = outputTerm.trim().split(' ');

	const inputs = inputString.split(',').map((term:string):[string,number] => {
	    const [coeffecient, compound] = term.trim().split(' ');

	    return [compound, parseInt(coeffecient)]
	})

	reactionMap[compound] = {
	    amount: parseInt(amount),
	    inputs,
	}
    })

    const needMap:{[key:string]:number} = {
	FUEL: fuelTarget,
	ORE: 0,
    }

    let limitter = 0;
    while(Object.keys(needMap).filter(i => i !== 'ORE').length != 0){
	limitter ++;
	if(limitter > 10000) throw new Error('Hit iteration limit');
	
	Object.entries(needMap).filter(([i]) => i !== 'ORE').slice(0,1).forEach(([compound,amount]) => {
	    // console.log(needMap, haveMap)
	    const have = haveMap[compound] || 0;

	    // console.log(`Making ${compound}, have ${have} need $ {amount}`)
	    const reaction = reactionMap[compound];
	    if(!reaction){
		throw new Error(`Reaction not found for ${compound}`)
	    }
	    
	    const multiple = Math.ceil((amount - have)/reaction.amount);

	    reaction.inputs.forEach(([compound,amount]) => {
		const required = amount * multiple;
		const have = haveMap[compound] || 0;
		// console.log(`Have ${have} ${compound}, need ${required}`)
		
		haveMap[compound] = Math.max(have - required, 0);

		if(required > have){
		    needMap[compound] = required - have + (needMap[compound] || 0);
		}
	    })
	    
	    delete needMap[compound];

	    haveMap[compound] = have + multiple * reaction.amount - amount;
	})
    }
    
    return [needMap.ORE || 0, haveMap];
}

const calculateFuel = (input:string): number => {
    let ore = 1000000000000;
    
    const [fuelCost] = calculateCost(input);

    let fuelMade = 0;

    let leftOvers = {};
    
    while (ore > 0) {
	const chunkSize = Math.max(Math.pow(10, Math.floor(Math.log10(ore/fuelCost))), 1);
	const [oreCost, newLeftOvers] = calculateCost(input,chunkSize, leftOvers);

	leftOvers = newLeftOvers;

	ore -= oreCost
	if(ore > 0){
	    fuelMade += chunkSize
	}
    }
    
    
    return fuelMade;
}

const tests = [
    {
    // 	file: './test1.txt',
    // 	required: 31,
	// },{
	// file: './test3.txt',
	// required: 165,
    // }, {
    	file: './test2.txt',
    	required: 82892753,
    }
]

tests.forEach(test => {
    const input = readFileSync(test.file).toString();

    const output = calculateFuel(input);

    if(output !== test.required){
	throw new Error(`Expected ${test.required} got ${output}`)
    }
})


console.log(calculateFuel(readFileSync('./input.txt').toString()));
