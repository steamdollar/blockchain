import { Block } from '@core/blockchain/block'
import { GENESIS } from '@core/config'

describe('Block 검증', () => {

    let newBlock:Block 

    
    it('블록생성', () => {
        const data = ['Block #2']

        newBlock = Block.generateBlock(GENESIS, data, GENESIS)
        const newBlock2 = new Block(newBlock, data, GENESIS)
    })

    it('block confirmation', () => {

        const isValidBlock = Block.isValidNewBlock(newBlock, GENESIS)

        if( isValidBlock.isError) {
            return expect(true).toBe(false)
        }
        expect(isValidBlock.isError).toBe(false)
    })

})
