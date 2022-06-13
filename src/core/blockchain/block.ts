import { BlockHeader } from "./blockHeader";
import { SHA256 } from 'crypto-js'
import merkle from 'merkle'
import { GENESIS } from "@core/config";

export class Block extends BlockHeader implements IBlock {
    public hash : string
    public data : string[]
    public merkleRoot : string

    constructor( _previousBlock : Block, _data : string[]) {
        super(_previousBlock)

        this.data = _data

        const merkleRoot = Block.getMerkleRoot(_data)
        this.merkleRoot = merkleRoot
        
        this.hash = Block.createBlockHash(this)
    }

    public static getGenesis(): Block {
        return GENESIS
    }

    public static generateBlock ( _previousBlock : Block, _data : string[] ): Block {
        const generateBlock = new Block ( _previousBlock, _data)
        return generateBlock
    }

    public static getMerkleRoot<T>(_data : T[]):string {
        const merkleTree = merkle("sha256").sync(_data)
        return merkleTree.root() || '0'.repeat(64)
    }

    public static createBlockHash(_block :Block) : string {
        const { version, timestamp, height, previousHash, merkleRoot } = _block
        const values = `${version}${timestamp}${height}${previousHash}${merkleRoot}`
        return SHA256(values).toString()
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