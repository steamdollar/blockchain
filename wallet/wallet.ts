import { randomBytes } from "crypto";
import elliptic from 'elliptic'
import fs from 'fs'
import path from 'path'
import { SHA256 } from 'crypto-js'

const ec = new elliptic.ec('secp256k1')
const dir = path.join(__dirname, '../data')

export class Wallet {
    public account : string
    public privateKey : string
    public publicKey : string
    public balance : number

    constructor(_privateKey : string = '') {
        this.privateKey = _privateKey || this.getPrivateKey()
        this.publicKey = this.getPublicKey()
        this.account = this.getAccount()
        this.balance = 0

        Wallet.createWallet(this)
    }

    //

    static createSign ( _obj : any) {
        const { sender : {account, publicKey}, receiver, amount} = _obj

        const hash : string = SHA256([publicKey, receiver, amount].join('')).toString()

        const privateKey : string = Wallet.getWalletPrivatekey(account)

        const keyPair : elliptic.ec.KeyPair = ec.keyFromPrivate(privateKey)
        return keyPair.sign(hash, 'hex')
    }

    //

    static createWallet( myWallet : Wallet) {
        const filename = path.join(dir, myWallet.account)
        const filecontent = myWallet.privateKey
        fs.writeFileSync(filename, filecontent)
    }

    static getWalletList() : string[] {
        const files : string [] = fs.readdirSync(dir)
        return files
    }

    static getWalletPrivatekey ( _wallet : string) {
        const filepath = path.join(dir, _wallet)
        // 지갑 주소를 파일 이름으로 저장했으므로 파일 이름을 읽어온다.
        const filecontent = fs.readFileSync(filepath)
        // 해당 파일의 내용이 개인키이므로 파일을 읽어서 개인키를 가져올 수 있다.
        return filecontent.toString()
        // 개인키를 string으로 바꿔 리턴
    }

    //

    public getPrivateKey() : string {
        return randomBytes(32).toString('hex')
    }

    public getPublicKey():string {
        const keyPair = ec.keyFromPrivate(this.privateKey)
        return keyPair.getPublic().encode('hex', true)
    }

    public getAccount():string {
        return Buffer.from(this.publicKey).slice(26).toString()
    }
}