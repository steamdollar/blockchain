declare interface ITxOut {
    account : string
    amount : number
}
// 입금 정보 (account로 amount만큼 돈이 들어옴)

declare interface ITxIn {
    txOutId : string
    txOutIndex : number
    signature? : string | undefined
}
// 출금 정보 ( 이게 뭔지 잘 모르겠다..)
// ITX'In' 이지만 이건 출금 정보다
// 그래서 출금한 사람, 출금한 사람의 서명, 블럭내에서 출금의 index 

declare interface ITransaction {
    hash : string
    txOuts : ITxOut[]
    txIns : ITxIn[]
}
// 입금, 출금 정보를 가진 객체들을 모은 tx 객체에 대한 정보

declare interface IUnspentTxOut {
    txOutId : string
    txOutIndex : number
    account : string
    amount : number
}
// txOutId, txOutIndex 는 참조해오는거고, account, amount는 받은 사람의 정보

