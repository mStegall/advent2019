let count = 0;

outer:
for(let i = 245182; i <= 790572; i ++){
    let runs : number[] = [];
    let currentRun = 1;
    let [last, ...digits] = i.toString().split('');

    for(let digit of digits){
	if(digit < last){
	    continue outer;
	}

	if(last === digit){
	    currentRun ++;
	} else {
	    runs.push(currentRun);
	    currentRun = 1;
	}
	last = digit
    }

    runs.push(currentRun)

    if(runs.includes(2)){
	count ++;
    } 
}

console.log(count);
