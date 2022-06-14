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
}