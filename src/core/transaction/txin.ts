export class TxIn {
    public txOutId : string
    public txOutIndex : number 
    // tx의 해시값이 중복되는 걸 방지하기 위해 블럭의 height 값을 가져올 것이다.
    public signature? : string 
    // 원래는 signature class가 맞다

    constructor (_txOutId : string, _txOutIndex : number, _signature : string | undefined = undefined) {
        this.txOutId = _txOutId
        this.txOutIndex = _txOutIndex
        this.signature = _signature
    }
}