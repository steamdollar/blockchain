interface IBoard {
    name : string
    phone : number
    army : boolean
    address : string
}

const data : IBoard = {
    name : 'lsj',
    phone: 1065313476,
    army : true,
    address : 'seoul'
}

console.log(data)

let a : number[] = [1,2,3,4]

console.log(a)

function binaryCode(num :number) : boolean {
    if(num == 0) return false
    return true
}

const result0 = binaryCode(0)
const result1 = binaryCode(1)
const result2 = binaryCode(2)

console.log( result0, result1, result2)