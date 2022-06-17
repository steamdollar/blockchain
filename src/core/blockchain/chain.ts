import { DIFFICULTY_ADJUSTMENT_INTERVAL } from "@core/config";
import { Block } from "./block";

export class Chain {
    public blockchain : Block[]

    constructor() {
        this.blockchain = [Block.getGenesis()]
    }

    public getChain() : Block[] {
        return this.blockchain
    }

    public getLength() : number {
        return this.blockchain.length
    }

    public getLatestBlock() : Block {
        return this.blockchain[ this.blockchain.length -1 ]
    }

    public addBlock (data : string[]) : Failable<Block, string> {
        const previousBlock = this.getLatestBlock()
        const adjustmentBlock : Block = this.getAdjustmentBlock()
        const newBlock = Block.generateBlock(previousBlock, data, adjustmentBlock )
        const isValid = Block.isValidNewBlock(newBlock, previousBlock)

        if(isValid.isError === true) {
            return { isError : true, error : isValid.error }
        }
        this.blockchain.push(newBlock)
        
        return { isError : false, value : newBlock}
    }

    public getAdjustmentBlock() {
        const currentLength = this.getLength()

        const adjustmentBlock : Block =
        currentLength < DIFFICULTY_ADJUSTMENT_INTERVAL
        ? Block.getGenesis()
        : this.blockchain [ currentLength - DIFFICULTY_ADJUSTMENT_INTERVAL + 1 ]
        return adjustmentBlock
    }

    public addToChain ( _receivedBlock : Block ) : Failable < undefined, string > {
        const isValid = Block.isValidNewBlock(_receivedBlock, this.getLatestBlock())
        if (isValid.isError) {
            return { isError : true, error : isValid.error}
        }

        this.blockchain.push(_receivedBlock)
        return { isError : false, value : undefined}
    }

    public isValidChain(_chain : Block[]): Failable <undefined, string> {
        const genesis = _chain[0]

        for (let i = 1; i < _chain.length; i++) {
            const newBlock  = _chain[i]
            const previousBlock  = _chain[i-1]
            const isValid = Block.isValidNewBlock(newBlock, previousBlock)
            if ( isValid.isError ) {
                return { isError : true, error : isValid.error }
            }
        }
        return { isError : false, value : undefined }
    }

    public replaceChain (receivedChain : Block[]) : Failable < undefined, string > {
        const latestReceivedBlock : Block = receivedChain[receivedChain.length - 1]
        const latestBlock : Block = this.getLatestBlock()

        if( latestReceivedBlock.height === 0 ) {
            return { isError : true, error : 'this guys block is genesis'}
        }
        if( latestReceivedBlock.height === 0) {
            return { isError : true, error : 'my chain > one block short > should send message.1'}
        }
        if ( latestReceivedBlock.height <= latestBlock.height) {
            return { isError : true, error : 'my chain is longer > should send message.2'}
        }
        this.blockchain = receivedChain

        return { isError : false, value : undefined }
    }
}