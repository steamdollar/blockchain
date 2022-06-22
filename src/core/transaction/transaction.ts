import { SHA256 } from "crypto-js"
import { TxIn } from "./txin"
import { TxOut } from "./txout"
import { unspentTxOut } from "./unspentTxOut"


export class Transaction {
    public hash : string
    public txIns : TxIn[]
    public txOuts : TxOut[]

    constructor ( _txIns : TxIn[], _txOuts : TxOut[] ) {
        this.txIns = _txIns
        this.txOuts = _txOuts
        this.hash = this.createTransactionHash()
        // 여기서의 hash는 'tx'의 고유한 값이며, txin, txout의 내용을 전부 string으로 이어붙여 만든다
    }

    createTransactionHash() : string {
        const txoutContent : string = this.txOuts.map( v=> Object.values(v).join('')).join('')
        // txOutid, txOutInedx, signature를 문자로 한줄로 이어서 그 것들을 이음
        const txinContent : string = this.txOuts.map( v=> Object.values(v).join('')).join('')

        console.log(txoutContent, txinContent)
        return SHA256(txoutContent + txinContent).toString()
    }

    createUTXO () : unspentTxOut[] {
        let result : unspentTxOut[] = this.txOuts.map((v,k) => {
            return new unspentTxOut(this.hash, k, v.account, v.amount)
        })
        // v = txout : TxOut, k = index: number 
        return result
    } 
}