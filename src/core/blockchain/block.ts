import { BlockHeader } from "./blockHeader";
import { SHA256 } from 'crypto-js'
import merkle from 'merkle'
import { GENESIS, DIFFICULTY_ADJUSTMENT_INTERVAL, UNIT, BLOCK_GENERATION_INTERVAL } from "@core/config";
import hexToBinary from 'hex-to-binary'

export class Block extends BlockHeader implements IBlock {
    public hash : string
    public data : ITransaction[]
    public merkleRoot : string
    public difficulty : number
    public nonce : number

    constructor( _previousBlock : Block, _data : ITransaction[], _adjustmentBlock : Block ) {
        super(_previousBlock)

        const merkleRoot = Block.getMerkleRoot(_data)
        this.merkleRoot = merkleRoot
        this.nonce = 0
        this.difficulty = Block.getDifficulty(this, _adjustmentBlock, _previousBlock)
        
        this.hash = Block.createBlockHash(this)
        this.data = _data
    }

    public static getGenesis(): Block {
        return GENESIS
    }

    public static getMerkleRoot<T>(_data : T[]):string {
        const merkleTree = merkle("sha256").sync(_data)
        return merkleTree.root() || '0'.repeat(64)
    }

    public static createBlockHash(_block :Block) : string {
        const { version, timestamp, height, previousHash, merkleRoot, difficulty, nonce } = _block
        const values = `${version}${timestamp}${height}${previousHash}${merkleRoot}${difficulty}${nonce}`
        return SHA256(values).toString()
    }

    public static generateBlock ( _previousBlock : Block, _data : ITransaction[], _adjustmentBlock : Block ): Block {
        const generateBlock = new Block ( _previousBlock, _data, _adjustmentBlock)
        const newBlock = Block.findBlock(generateBlock)

        return newBlock
    }

    public static findBlock ( _generateBlock : Block ) : Block {
        let hash : string
        let nonce : number = 0
        
        while (true) {
            nonce++
            _generateBlock.nonce = nonce
            hash = Block.createBlockHash(_generateBlock)

            const binary : string = hexToBinary(hash)
            const result : boolean = binary.startsWith('0'.repeat(_generateBlock.difficulty))
            if(result == true) {
                _generateBlock.hash = hash
                return _generateBlock
            } 
        }
    }

    public static getDifficulty(_newBlock : Block, _adjustmentBlock : Block, _previousBlock : Block ) : number {
        if(_adjustmentBlock.height === 0 ) return 0
        if (_newBlock.height % DIFFICULTY_ADJUSTMENT_INTERVAL !== 0 ) {
            return _previousBlock.difficulty
        }

        const timeTaken : number = _newBlock.timestamp - _adjustmentBlock.timestamp
        const timeExpected : number = UNIT * BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL

        if ( timeTaken < timeExpected / 2 ) {
            return _adjustmentBlock.difficulty + 1
        }
        else if ( timeTaken >= timeExpected * 2 ) {
            return _adjustmentBlock.difficulty - 1
        }
        
        return _adjustmentBlock.difficulty

    }

    public static isValidNewBlock ( _newBlock :Block, _previousBlock : Block ) : Failable <Block, string > {
        if(_previousBlock.height + 1 !== _newBlock.height ) {
            return { isError : true, error : 'height error'}
        }

        if( _previousBlock.hash !== _newBlock.previousHash ) {
            return { isError : true, error : 'previousHash error'}
        }

        if ( Block.createBlockHash(_newBlock) !== _newBlock.hash ) {
            return { isError : true, error : 'hash error'}
        }

        return { isError : false, value: _newBlock }
    }
}