import {readFileSync} from "fs";

const lines = readFileSync("./input.txt").toString().split("\n").filter(i => i != "");

const calcFuel = (mass:number) : number => {
    if (mass < 1){
	return 0
    }
    
    const massFuel = Math.floor(mass / 3) - 2;
    const fuelFuel = calcFuel(massFuel);

    if (fuelFuel <= 0){
	return massFuel;
    }
  
    return fuelFuel + massFuel;
}

console.log(lines.reduce(( acc:number, line) =>  calcFuel(parseInt(line))+ acc, 0));
