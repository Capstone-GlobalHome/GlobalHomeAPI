import bitwise from 'bitwise'
const bits = bitwise.byte.read(42)
// [0, 0, 1, 0, 1, 0, 1, 0]

console.log(bitwise.bits.toString(bits, 4))
