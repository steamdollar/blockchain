declare interface IBlock extends IBlockHeader {
    merkleRoot: string
    hash: string
    data: string[]
    nonce : number
    difficulty :number
    
}

declare interface IBlockHeader {
    version: string
    height: number
    timestamp: number
    previousHash: string
}
