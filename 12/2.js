"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var input = fs_1.readFileSync('./input.txt').toString();
var parseInput = function (input) {
    var lines = input.split('\n').filter(function (i) { return i; });
    var format = /<x=([\-[0-9]*), y=([\-[0-9]*), z=([\-[0-9]*)>/;
    return lines.map(function (line) {
        var result = format.exec(line);
        if (!result) {
            throw new Error("Bad input format");
        }
        var _ = result[0], x = result[1], y = result[2], z = result[3];
        return {
            x: parseInt(x),
            y: parseInt(y),
            z: parseInt(z),
            dx: 0,
            dy: 0,
            dz: 0
        };
    });
};
var moons = parseInput(input);
var pairs = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]].map(function (_a) {
    var a = _a[0], b = _a[1];
    return [moons[a], moons[b]];
});
var states = new Set();
for (var i = 0; i < 100000000; i++) {
    pairs.forEach(function (_a) {
        var a = _a[0], b = _a[1];
        if (a.x < b.x) {
            a.dx++;
            b.dx--;
        }
        else if (a.x > b.x) {
            a.dx--;
            b.dx++;
        }
        if (a.y < b.y) {
            a.dy++;
            b.dy--;
        }
        else if (a.y > b.y) {
            a.dy--;
            b.dy++;
        }
        if (a.z < b.z) {
            a.dz++;
            b.dz--;
        }
        else if (a.z > b.z) {
            a.dz--;
            b.dz++;
        }
    });
    moons.forEach(function (moon) {
        moon.x += moon.dx;
        moon.y += moon.dy;
        moon.z += moon.dz;
    });
    var state = moons.map(function (moon, i) { return moon.x + "," + moon.y + "," + moon.z + "," + moon.dx + "," + moon.dy + "," + moon.dz; }).join(':');
    if (states.has(state)) {
        console.log(i);
        break;
    }
    states.add(state);
}
