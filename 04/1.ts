let count = 0;

outer:
for(let i = 245182; i <= 790572; i ++){
    let double = false;
    let [last, ...digits] = i.toString().split('');

    for(let digit of digits){
	if(digit < last){
	    continue outer;
	}

	double = double || last === digit

	last = digit
    }

    if(double){
	count ++;
    }
}

console.log(count);
