import { DIFFICULTY_ADJUSTMENT_INTERVAL, MINING_COMPENSATION } from "@core/config";
import { Transaction } from "@core/transaction/transaction";
import { TxIn } from "@core/transaction/txin";
import { TxOut } from "@core/transaction/txout";
import { unspentTxOut } from "@core/transaction/unspentTxOut";

import { Block } from "./block";

export class Chain {
    public blockchain : Block[]
    private unspentTxOuts : unspentTxOut[]

    constructor() {
        this.blockchain = [Block.getGenesis()]
        this.unspentTxOuts = []
    }

    // utxo 관련 함수
    public getunspentTxOuts() : unspentTxOut[] {
        return this.unspentTxOuts
        // 블록 체인 상의 utxo를 가져온다.
    }

    public appendUTXO (utxo : unspentTxOut[]) : void {
        this.unspentTxOuts.push(...utxo)
        // 새로 생긴 utxo를 기존 utxo에 추가한다
    }

    // 체인 정보 가져오는 함수

    public getChain() : Block[] {
        return this.blockchain
    }

    public getLength() : number {
        return this.blockchain.length
    }

    public getLatestBlock() : Block {
        return this.blockchain[ this.blockchain.length -1 ]
    }
    

    public miningBlock ( _account : string) {
        const txin : ITxIn = new TxIn('', this.getLatestBlock().height + 1)
        const txout : ITxOut = new TxOut( _account, MINING_COMPENSATION )

        const transaction : Transaction = new Transaction([txin], [txout])
        const utxo = transaction.createUTXO()
        this.appendUTXO(utxo)

        return this.addBlock([transaction])
    }

    public addBlock (data : ITransaction[]) : Failable<Block, string> {
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