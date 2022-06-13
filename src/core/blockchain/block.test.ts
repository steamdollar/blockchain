import { Block } from '@core/blockchain/block'
import { isExportDeclaration } from 'typescript'

describe('Block 검증', () => {
    let newBlock : Block
    let newBlock2 : Block

    const GENESIS : IBlock = {
        version : '1.0.0',
        height : 0,
        hash : '0'.repeat(64),
        timestamp : 1231006506,
        previousHash : '0'.repeat(64),
        merkleRoot : '0'.repeat(64),
        data : ['genesis Block']
    }
    // 제네시스 블럭만은 우리가 초기값을 직접 입력해주어야 한다.

    it('block 생성', () => {
        const data = ['Blockchain']
        newBlock = new Block( GENESIS ,data)
        newBlock2 = new Block (newBlock, data)

        console.log(newBlock)
        console.log(newBlock2)
    })

    it('block verification', () => {
        const isValidBlock = Block.isValidNewBlock(newBlock2, newBlock)

        if ( isValidBlock.isError === true ){
            console.error(isValidBlock.error)
            return expect(true).toBe(false)
        }

        expect(isValidBlock.isError).toBe(false)
    })
})