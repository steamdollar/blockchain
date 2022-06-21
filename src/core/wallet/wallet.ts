import { SHA256 } from 'crypto-js'
import elliptic from 'elliptic'

const ec = new elliptic.ec('secp256k1')

export type Signature = elliptic.ec.Signature

export interface ReceivedTx {
    sender : string
    receiver : string
    amount : number
    signature : Signature
}

export class Wallet {
    public publicKey : string
    public account : string
    public balance : number
    public signature : Signature

    constructor( _sender : string, _signature : Signature) {
        
        this.publicKey = _sender
        // sender의 값 자체가 보낸 사람의 공개 키
        this.account = this.getAccount()
        // 이를 이용해 직바 주소를 구한다.
        this.balance = 0
        // balance에 대한 부분은 추후 추가 구현
        this.signature = _signature
    }

    getAccount() : string {
        return Buffer.from(this.publicKey).slice(26).toString()
    }
    
    // 정말 지갑 주소의 원래 주인이 맞는지 서명을 검증한다

    static sendTransaction ( _receivedTx : ReceivedTx ) {
        const verify = Wallet.getVerify(_receivedTx)
        // 우선 서명을 검증한다 (검증 함수는 하단에 작성)
        
        if( verify.isError ) throw new Error (verify.error)
        // 검증 과정에서 에러가 난다면 error 출력

        const myWallet = new this(_receivedTx.sender, _receivedTx.signature)
        // 아닌 경우 지갑을 갱신
    }

    static getVerify ( _receivedTx : ReceivedTx) : Failable<undefined, string> {
        const { sender, receiver, amount, signature } = _receivedTx
        
        const data : any[] = [sender, receiver, amount]
        const hash : string = SHA256(data.join('')).toString()

        const keyPair = ec.keyFromPublic(sender, 'hex')
        const isVerify = keyPair.verify(hash, signature)

        if( isVerify === false) {
            return { isError : true, error : '서명이 올바르지 않습니다' }
        }
        
        return { isError : false, value : undefined }
    }
}
