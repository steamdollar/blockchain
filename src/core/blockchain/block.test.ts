import { Block } from '@core/blockchain/block'

describe('Block 검증', () => {
    let genesisBlock : Block = {
        version: '1.0.0',
        height : 0,
        hash : '0'.repeat(64),
        timestamp : 1231006596,
        previousHash : '0'.repeat(64),
        merkleRoot : '0'.repeat(64),
        data : ['genesis block']
    }
    it('블록 생성', () => {

        const newBlock = new Block(genesisBlock)
        const data = ['Block #2']
        newBlock.data = [...data]
        console.log(newBlock)
    })
})