export class TxOut {
    public account : string
    public amount : number

    constructor ( _account : string, _amount : number) {
        this.account = _account
        this.amount = _amount
    }
}