import SHA256 from 'crypto-js/sha256'
import hexToBinary from 'hex-to-binary'

const a : string = '10'

const hash:string = SHA256(a).toString()
console.log(hash)

const binary = hexToBinary(hash)
console.log(binary)