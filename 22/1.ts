import { readFileSync } from "fs";

const deck = Array(10007).fill(0).map((_, i) => i)

const reInc = /deal with increment (\d*)/
const reCut = /cut (-?\d*)/

const out = readFileSync('./22/input.txt').toString().split('\n').reduce((d, i) => {
    console.log(d.indexOf(2019))

    if(i == "deal into new stack"){
        return d.reverse()
    }

    const res = reInc.exec(i)
    if(res){
        const mod = parseInt(res[1],10)
        const next = Array(d.length)
        d.forEach((v,i) =>{
            next[(i * mod) %d.length] =v
        })
        return next
    }

    const res2 = reCut.exec(i)
    if(res2) {
        const index = parseInt(res2[1],10)

        return [...d.slice(index),...d.slice(0,index)]
    }

    return d
}, deck)

console.log(out.indexOf(2019))