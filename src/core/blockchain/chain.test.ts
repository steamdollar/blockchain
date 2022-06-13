import { Chain } from '@core/blockchain/chain'

describe('Chain function Check', () => {
    let node : Chain = new Chain()

    it('getChain() check', () => {
        console.log(node.getChain())
    })

    
    it('getLength() check', () => {
        console.log(node.getLength())
    })

    
    it('getLatestBLock() check', () => {
        console.log(node.getLatestBlock())
    })

    it('addBlock() check', () => {
        for (let i = 1; i <=10; i++ ) {
            node.addBlock([`Block #${i}`])
        }
        console.log(node.getChain())
    })
})