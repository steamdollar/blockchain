import { randomBytes } from 'crypto'
import elliptic from 'elliptic'
import { SHA256 } from 'crypto-js'

const ec = new elliptic.ec('secp256k1')

describe('wallet study', () => {
    let privKey : string
    let pubKey : string
    let signature : elliptic.ec.Signature

    it('privateKey', () => {
        privKey = randomBytes(32).toString('hex')
        // console.log(privKey, privKey.length)
        // c50f2744a35be1e56306d3bcdb3f24efafe8fb664cc616e386cd1ebad1ca133d (64자리 16진수)
    })
    
    it('create pulicKey', () => {
        const keyPair = ec.keyFromPrivate(privKey)
        // console.log(keyPair) << 얘는 봐도 뭔지 모름
        pubKey = keyPair.getPublic().encode('hex', true)
        // console.log(pubKey)
    })

    it('digital sign', () => {
        const keyPair = ec.keyFromPrivate(privKey)
        const hash = SHA256('txhash').toString()

        signature = keyPair.sign(hash, 'hex')
        //
    })

    it('sig verify', () => {
        const hash = SHA256('txhash').toString() // 얘도 해시화 해줘야 함
        const verify : boolean = ec.verify(hash, signature, ec.keyFromPublic(pubKey, 'hex'))
        // hash, 공개키를 알아야 true가 나온다.
        console.log(verify) // true
    })

    it('create account', () => {
        const buffer = Buffer.from(pubKey)
        // console.log(buffer) // Buffer 형태로 나옴
        const address = buffer.slice(26).toString()
        console.log(address)
    })
})