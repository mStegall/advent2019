import {readFileSync} from "fs";

const lines = readFileSync("./input.txt").toString().split("\n");

const calcFuel = (mass:number) => Math.floor(mass / 3) - 2;

console.log(lines.reduce((acc,line) => calcFuel(parseInt(line)) + acc));
