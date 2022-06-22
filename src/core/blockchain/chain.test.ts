import { Chain } from '@core/blockchain/chain'
import { Wallet } from '@core/wallet/wallet'

describe('Chain function Check', () => {
    let ws : Chain = new Chain()

    // it('getChain() check', () => {
    //     console.log(node.getChain())
    // })

    
    // it('getLength() check', () => {
    //     console.log(node.getLength())
    // })

    
    // it('getLatestBLock() check', () => {
    //     console.log(node.getLatestBlock())
    // })

    it('addBlock() check', () => {
        ws.miningBlock('10187335f40af237c8fe4764bdabbf6f34c340ff')
        ws.miningBlock('10187335f40af237c8fe4764bdabbf6f34c340ff')
        ws.miningBlock('10187335f40af237c8fe4764bdabbf6f34c340ff')

        console.log(ws.getunspentTxOuts())

        const balance = Wallet.getBalance('10187335f40af237c8fe4764bdabbf6f34c340ff', ws.getunspentTxOuts())
        console.log(balance)
    })
})