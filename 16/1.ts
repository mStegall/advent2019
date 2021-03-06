function fft(input: string): string {
    const pattern = [0, 1, 0, -1]

    let chars = input.split('').map(i => parseInt(i, 10))
    for (let i = 0; i < 100; i++) {
        let newChars: number[] = []
        chars.forEach((_, i) => {
            let base = 0
            let k = 0
            let l = 0
            for (let j = i; j < chars.length; j++) {
                
                if (k == 0) {
                    base += chars[j]
                } else if (k == 2) {
                    base -= chars[j]
                }

                l ++
                if (l>i){
                    l = 0
                    k ++
                    k %=4
                }
            }
            newChars.push(Math.abs(base) % 10)
        })

        chars = newChars
    }

    return chars.join('')
}

const input = '59790677903322930697358770979456996712973859451709720515074487141246507419590039598329735611909754526681279087091321241889537569965210074382210124927546962637736867742660227796566466871680580005288100192670887174084077574258206307557682549836795598410624042549261801689113559881008629752048213862796556156681802163843211546443228186862314896620419832148583664829023116082772951046466358463667825025457939806789469683866009241229487708732435909544650428069263180522263909211986231581228330456441451927777125388590197170653962842083186914721611560451459928418815254443773460832555717155899456905676980728095392900218760297612453568324542692109397431554'
// part1
console.log(fft(input).slice(0,8))
