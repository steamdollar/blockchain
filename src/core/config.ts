export const GENESIS : IBlock = {
    version : '1.0.0',
    height : 0,
    hash : '0'.repeat(64),
    timestamp : 1231006506,
    previousHash : '0'.repeat(64),
    merkleRoot : '0'.repeat(64),
    data : ['genesis Block'],
    nonce : 0,
    difficulty : 0
}

export const DIFFICULTY_ADJUSTMENT_INTERVAL : number = 10
// 난이도 측정 간격

export const BLOCK_GENERATION_INTERVAL : number = 10
// DIFFICUTLY_ADJUSTMENT_INTERVAL 개의 블럭 갯수를 생성했을때 걸리는 시간 (기준치)

export const UNIT : number = 60
// block 하나가 생성되는데 걸리는 시간 ( 기준치 )