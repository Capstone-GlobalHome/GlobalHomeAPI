
// console.log(bitwise.bits.toString(bits1, 8))

// console.log(bitwise.bits.and(bits1))
var x_as_binary_string = "00000011"
console.log(x_as_binary_string);
//finally convert temp char to '0
const x = parseInt(x_as_binary_string.replace(/1/g, 'x')//convert '1' to temp char('x')
    .replace(/0/g, '1')//convert '0' to '1'
    .replace(/x/g, '0'), 2).toString(16).toUpperCase();
console.log(x);
const deci = parseInt(x, 16)
console.log(deci);

const sum = 3618;

let checksum = parseInt(3618, 10).toString(16).toUpperCase();
// let checksum = "EE22"
console.log(checksum.length)
const checksumMock = "0000"
// let final;
if ((checksumMock.length - checksum.length) > 0) {
    let firstPart = checksumMock.substr(0, checksumMock.length - checksum.length);
    checksum = firstPart + checksum;
}
console.log(checksum)


var htob = parseInt(complement_as_string, 2).toString(16).toUpperCase();
console.log(htob);

const comp=~htob
var decitohex = parseInt(comp, 2).toString(16).toUpperCase();
console.log(decitohex);

let value=parseInt('03', 16).toString(2).toUpperCase();

console.log(value);

