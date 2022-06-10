import { BlockHeader } from './blockHeader'

export class Block extends BlockHeader implements IBlock {
    public hash :string
    public merkleRoot : string
    public data : string[]

    constructor(_previousBlock: Block) {
        super(_previousBlock)
        // BlockHeader를 바로 가져다 쓰는 명령어

        this.hash = ''
        this.merkleRoot = ''
        this.data = []
    }
}