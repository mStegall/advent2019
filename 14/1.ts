import { readFileSync } from 'fs'

interface reaction {
    amount: number;
    inputs: [string, number][];
}

const calculateCost = (input:string): number => {
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

    // console.log(JSON.stringify(reactionMap,null,2));

    const needMap:{[key:string]:number} = {
	FUEL: 1,
	ORE: 0,
    }

    const haveMap:{[key:string]:number}= {};
    let limitter = 0;
    while(Object.keys(needMap).filter(i => i !== 'ORE').length != 0){
	limitter ++;
	if(limitter > 10000) throw new Error('Hit iteration limit');
	
	Object.entries(needMap).filter(([i]) => i !== 'ORE').slice(0,1).forEach(([compound,amount]) => {
	    console.log(needMap, haveMap)
	    const have = haveMap[compound] || 0;

	    console.log(`Making ${compound}, have ${have} need $ {amount}`)
	    const reaction = reactionMap[compound];
	    if(!reaction){
		throw new Error(`Reaction not found for ${compound}`)
	    }
	    
	    const multiple = Math.ceil((amount - have)/reaction.amount);

	    reaction.inputs.forEach(([compound,amount]) => {
		const required = amount * multiple;
		const have = haveMap[compound] || 0;
		console.log(`Have ${have} ${compound}, need ${required}`)
		
		haveMap[compound] = Math.max(have - required, 0);

		if(required > have){
		    needMap[compound] = required - have + (needMap[compound] || 0);
		}
	    })
	    
	    delete needMap[compound];

	    haveMap[compound] = have + multiple * reaction.amount - amount;
	})
    }
    
    return needMap.ORE || 0;
}

const tests = [
    {
    // 	file: './test1.txt',
    // 	required: 31,
	// },{
	// file: './test3.txt',
	// required: 165,
    // }, {
    	// file: './test2.txt',
    	// required: 13312,
    }
]

// tests.forEach(test => {
//     const input = readFileSync(test.file).toString();

//     const output = calculateCost(input);

//     if(output !== test.required){
// 	throw new Error(`Expected ${test.required} got ${output}`)
//     }
// })


console.log(calculateCost(readFileSync('./input.txt').toString()));
